import { Router, Response } from 'express';
import { prisma } from '../config/db.js';
import { optionalAuthenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { FreshnessService } from '../services/freshnessService.js';
import { MatchingService } from '../services/matchingService.js';

const router = Router();

router.use(optionalAuthenticateToken);

// 1. Get products enriched with real market prices and farmer pricing ranges
router.get('/products-with-market-price', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { district = 'Salem' } = req.query;

    const products = await prisma.product.findMany({
      include: {
        freshnessRules: true,
        marketPrices: {
          where: { district: String(district) },
          orderBy: { date: 'desc' },
          take: 1,
        },
        batches: {
          where: {
            status: 'ACTIVE',
            quantity: { gt: 0 },
            freshnessStatus: { not: 'EXPIRED' },
          },
          select: {
            id: true,
            pricePerKg: true,
            quantity: true,
            qualityGrade: true,
            freshnessStatus: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const enriched = products.map((p) => {
      const mandiPrice = p.marketPrices[0] || {
        minPrice: p.referenceMinPrice,
        modalPrice: Math.round((p.referenceMinPrice + p.referenceMaxPrice) / 2),
        maxPrice: p.referenceMaxPrice,
        date: new Date().toISOString().split('T')[0],
      };

      const prices = p.batches.map((b) => b.pricePerKg);
      const minFarmerPrice = prices.length > 0 ? Math.min(...prices) : mandiPrice.minPrice;
      const maxFarmerPrice = prices.length > 0 ? Math.max(...prices) : mandiPrice.maxPrice;
      const totalAvailableKg = p.batches.reduce((sum, b) => sum + b.quantity, 0);

      // Savings compared to Mandi modal price
      const savingsPercent = mandiPrice.modalPrice > minFarmerPrice
        ? Math.round(((mandiPrice.modalPrice - minFarmerPrice) / mandiPrice.modalPrice) * 100)
        : 0;

      return {
        id: p.id,
        name: p.name,
        nameTamil: p.nameTamil,
        category: p.category,
        unit: p.unit,
        imageUrl: p.imageUrl,
        mandiPrice: {
          minPrice: mandiPrice.minPrice,
          modalPrice: mandiPrice.modalPrice,
          maxPrice: mandiPrice.maxPrice,
          district: String(district),
        },
        farmerPriceRange: {
          min: minFarmerPrice,
          max: maxFarmerPrice,
          activeBatchesCount: p.batches.length,
          totalAvailableKg,
        },
        savingsPercent,
      };
    });

    res.json(enriched);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Discover nearby verified farmers
router.get('/nearby-farmers', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const lat = parseFloat(String(req.query.lat || '11.6643'));
    const lng = parseFloat(String(req.query.lng || '78.1460'));
    const maxDistanceKm = parseFloat(String(req.query.maxDistanceKm || '50'));

    const farmers = await prisma.farmerProfile.findMany({
      include: {
        user: { select: { id: true, name: true, avatarUrl: true, mobile: true } },
        batches: {
          where: { status: 'ACTIVE', quantity: { gt: 0 } },
          include: { product: true },
          take: 3,
        },
        _count: {
          select: { batches: true, followers: true },
        },
      },
    });

    const enrichedFarmers = farmers
      .map((farmer) => {
        // Use batch coordinates or fallback coordinates
        const batchCoords = farmer.batches[0];
        const fLat = batchCoords?.latitude || 11.6643;
        const fLng = batchCoords?.longitude || 78.1460;
        const distance = MatchingService.calculateDistance(lat, lng, fLat, fLng);

        return {
          id: farmer.id,
          userId: farmer.userId,
          farmerId: farmer.farmerId,
          name: farmer.user.name,
          avatarUrl: farmer.user.avatarUrl,
          village: farmer.village,
          district: farmer.district,
          state: farmer.state,
          rating: farmer.rating,
          completedOrders: farmer.completedOrders,
          verified: farmer.verified,
          verificationStatus: farmer.verificationStatus || 'VERIFIED',
          farmingType: farmer.farmingType,
          mainCrops: farmer.mainCrops,
          distanceKm: distance,
          activeBatchesCount: farmer._count.batches,
          followerCount: farmer._count.followers,
          availableProduce: farmer.batches.map((b) => ({
            id: b.id,
            productName: b.product.name,
            productNameTamil: b.product.nameTamil,
            pricePerKg: b.pricePerKg,
            quantity: b.quantity,
          })),
        };
      })
      .filter((f) => f.distanceKm <= maxDistanceKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    res.json(enrichedFarmers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Batch Detail with Market Price Comparison & Farmer Reputation
router.get('/batches/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const batch = await prisma.produceBatch.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            freshnessRules: true,
            marketPrices: { orderBy: { date: 'desc' }, take: 1 },
          },
        },
        farmer: {
          include: {
            user: { select: { id: true, name: true, avatarUrl: true, mobile: true } },
            _count: { select: { followers: true } },
          },
        },
        images: true,
      },
    });

    if (!batch) {
      res.status(404).json({ error: 'Produce batch not found' });
      return;
    }

    const freshness = FreshnessService.calculateFreshness(
      batch.harvestedAt,
      batch.sellBy,
      batch.product.freshnessRules[0]
    );

    const mandiPrice = batch.product.marketPrices[0] || {
      minPrice: batch.product.referenceMinPrice,
      modalPrice: (batch.product.referenceMinPrice + batch.product.referenceMaxPrice) / 2,
      maxPrice: batch.product.referenceMaxPrice,
    };

    const priceDiffVsMandi = Math.round(((mandiPrice.modalPrice - batch.pricePerKg) / mandiPrice.modalPrice) * 100);

    // Get recent ratings for this farmer
    const ratings = await prisma.rating.findMany({
      where: { toUserId: batch.farmer.userId },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        fromUser: { select: { name: true, avatarUrl: true } },
      },
    });

    res.json({
      ...batch,
      freshness,
      mandiComparison: {
        modalPrice: mandiPrice.modalPrice,
        minPrice: mandiPrice.minPrice,
        maxPrice: mandiPrice.maxPrice,
        priceDifferencePercent: priceDiffVsMandi,
        isCheaperThanMandi: batch.pricePerKg < mandiPrice.modalPrice,
      },
      farmerReputation: {
        rating: batch.farmer.rating,
        completedOrders: batch.farmer.completedOrders,
        verificationStatus: batch.farmer.verificationStatus || 'VERIFIED',
        followersCount: batch.farmer._count.followers,
        recentReviews: ratings,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
