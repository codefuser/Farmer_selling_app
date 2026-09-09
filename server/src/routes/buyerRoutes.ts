import { Router, Response } from 'express';
import { prisma } from '../config/db.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { MatchingService } from '../services/matchingService.js';
import { CollectiveSellingService } from '../services/collectiveSellingService.js';
import { FreshnessService } from '../services/freshnessService.js';

const router = Router();

router.use(authenticateToken);

async function getBuyerProfile(userId: string) {
  return await prisma.buyerProfile.findUnique({
    where: { userId },
    include: { user: true },
  });
}

// Buyer Dashboard Overview
router.get('/dashboard', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const buyer = await getBuyerProfile(req.user!.id);
    if (!buyer) {
      res.status(404).json({ error: 'Buyer profile not found' });
      return;
    }

    const demands = await prisma.buyerDemand.findMany({
      where: { buyerId: buyer.id },
      include: {
        product: true,
        offers: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const activeDemands = demands.filter((d) => d.status === 'OPEN' || d.status === 'MATCHED');

    const orders = await prisma.order.findMany({
      where: { buyerId: buyer.id },
      include: {
        items: { include: { batch: { include: { product: true } }, farmer: { include: { user: true } } } },
        deliveries: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const activeOrders = orders.filter((o) => !['COMPLETED', 'CANCELLED'].includes(o.status));

    res.json({
      buyer: {
        businessName: buyer.businessName,
        ownerName: buyer.ownerName,
        businessType: buyer.businessType,
        district: buyer.district,
        address: buyer.address,
      },
      stats: {
        activeDemandsCount: activeDemands.length,
        totalDemandsCount: demands.length,
        activeOrdersCount: activeOrders.length,
        totalOrdersCount: orders.length,
        totalSpent: orders.reduce((sum, o) => sum + o.totalAmount, 0),
      },
      recentDemands: activeDemands.slice(0, 3),
      activeOrders: activeOrders.slice(0, 3),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Marketplace Produce Explorer
router.get('/marketplace', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { productId, maxPrice, grade, freshness, sortBy } = req.query;

    await FreshnessService.evaluateAllActiveBatches();

    const whereClause: any = {
      status: 'ACTIVE',
      quantity: { gt: 0 },
      freshnessStatus: { not: 'EXPIRED' },
    };

    if (productId) whereClause.productId = String(productId);
    if (grade && grade !== 'ALL') whereClause.qualityGrade = String(grade);
    if (freshness && freshness !== 'ALL') whereClause.freshnessStatus = String(freshness);
    if (maxPrice) whereClause.pricePerKg = { lte: parseFloat(String(maxPrice)) };

    const batches = await prisma.produceBatch.findMany({
      where: whereClause,
      include: {
        product: { include: { freshnessRules: true } },
        farmer: { include: { user: true } },
      },
      orderBy: sortBy === 'PRICE_ASC' ? { pricePerKg: 'asc' } : { createdAt: 'desc' },
    });

    const buyer = await getBuyerProfile(req.user!.id);
    const buyerLat = buyer?.latitude || 11.6643;
    const buyerLng = buyer?.longitude || 78.1460;

    const formatted = batches.map((batch) => {
      const distance = MatchingService.calculateDistance(
        buyerLat,
        buyerLng,
        batch.latitude,
        batch.longitude
      );
      const freshnessInfo = FreshnessService.calculateFreshness(
        batch.harvestedAt,
        batch.sellBy,
        batch.product.freshnessRules[0]
      );
      return {
        ...batch,
        distanceKm: distance,
        freshness: freshnessInfo,
      };
    });

    // Client-side sorting options
    if (sortBy === 'NEAREST') {
      formatted.sort((a, b) => a.distanceKm - b.distanceKm);
    } else if (sortBy === 'FRESHEST') {
      formatted.sort((a, b) => b.freshness.percentRemaining - a.freshness.percentRemaining);
    } else if (sortBy === 'RATING') {
      formatted.sort((a, b) => b.farmer.rating - a.farmer.rating);
    }

    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create Buyer Demand
router.post('/demands', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const buyer = await getBuyerProfile(req.user!.id);
    if (!buyer) {
      res.status(404).json({ error: 'Buyer profile not found' });
      return;
    }

    const {
      productId,
      requiredQuantity,
      minBudget,
      maxBudget,
      requiredGrade = 'A',
      deliveryDeadline,
      location,
      maxDistanceKm = 25,
      notes,
    } = req.body;

    if (!productId || !requiredQuantity || !minBudget || !maxBudget) {
      res.status(400).json({ error: 'Product, required quantity, and budget range are required' });
      return;
    }

    const demandCount = await prisma.buyerDemand.count();
    const demandCode = `DEM-${new Date().getFullYear()}-${String(demandCount + 1).padStart(4, '0')}`;

    const demand = await prisma.buyerDemand.create({
      data: {
        demandCode,
        buyerId: buyer.id,
        productId,
        requiredQuantity: parseFloat(requiredQuantity),
        minBudget: parseFloat(minBudget),
        maxBudget: parseFloat(maxBudget),
        requiredGrade,
        deliveryDeadline: deliveryDeadline ? new Date(deliveryDeadline) : new Date(Date.now() + 24 * 3600 * 1000),
        location: location || buyer.address,
        district: buyer.district,
        latitude: buyer.latitude,
        longitude: buyer.longitude,
        maxDistanceKm: parseFloat(String(maxDistanceKm)),
        status: 'OPEN',
        notes,
      },
      include: { product: true },
    });

    res.status(201).json({
      message: 'Demand posted successfully',
      demand,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get Demands
router.get('/demands', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const buyer = await getBuyerProfile(req.user!.id);
    if (!buyer) {
      res.status(404).json({ error: 'Buyer profile not found' });
      return;
    }

    const demands = await prisma.buyerDemand.findMany({
      where: { buyerId: buyer.id },
      include: {
        product: true,
        offers: { include: { farmer: { include: { user: true } }, batch: true } },
        collectiveOrders: { include: { members: { include: { farmer: { include: { user: true } } } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(demands);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get Demand Details & Smart Matches
router.get('/demands/:id/matches', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const matchResults = await MatchingService.findMatchesForDemand(id);
    res.json(matchResults);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Send Offer to Farmer
router.post('/demands/:id/offers', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const buyer = await getBuyerProfile(req.user!.id);
    if (!buyer) {
      res.status(404).json({ error: 'Buyer profile not found' });
      return;
    }

    const { id: demandId } = req.params;
    const { batchId, farmerId, offeredPricePerKg, quantity, notes } = req.body;

    if (!batchId || !farmerId || !offeredPricePerKg || !quantity) {
      res.status(400).json({ error: 'Missing offer parameters' });
      return;
    }

    const offer = await prisma.offer.create({
      data: {
        demandId,
        batchId,
        buyerId: buyer.id,
        farmerId,
        offeredPricePerKg: parseFloat(offeredPricePerKg),
        quantity: parseFloat(quantity),
        status: 'PENDING',
        notes,
      },
    });

    // Record initial offer in history
    await prisma.offerHistory.create({
      data: {
        offerId: offer.id,
        proposedByUserId: req.user!.id,
        pricePerKg: parseFloat(offeredPricePerKg),
        notes: notes || `Buyer initiated offer of ₹${offeredPricePerKg}/kg for ${quantity} kg`,
      },
    });

    // Notify farmer
    const farmer = await prisma.farmerProfile.findUnique({
      where: { id: farmerId },
      include: { user: true },
    });

    if (farmer) {
      await prisma.notification.create({
        data: {
          userId: farmer.userId,
          title: 'New Offer Received!',
          message: `${buyer.businessName} has made an offer of ₹${offeredPricePerKg}/kg for ${quantity} kg.`,
          type: 'NEW_OFFER',
          metadataJson: JSON.stringify({ offerId: offer.id, demandId }),
        },
      });
    }

    res.status(201).json({ message: 'Offer sent successfully', offer });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create Collective Order from Recommended Pool
router.post('/demands/:id/collective-order', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const buyer = await getBuyerProfile(req.user!.id);
    if (!buyer) {
      res.status(404).json({ error: 'Buyer profile not found' });
      return;
    }

    const { id: demandId } = req.params;
    const { agreedPricePerKg, deliveryAddress, allocations } = req.body;

    if (!agreedPricePerKg || !allocations || allocations.length === 0) {
      res.status(400).json({ error: 'Agreed price and farmer allocations required' });
      return;
    }

    const result = await CollectiveSellingService.createCollectiveOrder({
      demandId,
      buyerId: buyer.id,
      agreedPricePerKg: parseFloat(agreedPricePerKg),
      deliveryAddress: deliveryAddress || buyer.address,
      allocations,
    });

    res.status(201).json({
      message: 'Collective order successfully established and escrow payment authorized',
      ...result,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get Buyer Orders
router.get('/orders', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const buyer = await getBuyerProfile(req.user!.id);
    if (!buyer) {
      res.status(404).json({ error: 'Buyer profile not found' });
      return;
    }

    const orders = await prisma.order.findMany({
      where: { buyerId: buyer.id },
      include: {
        items: {
          include: {
            farmer: { include: { user: true } },
            batch: { include: { product: true } },
          },
        },
        deliveries: { include: { vehicle: true } },
        payments: true,
        qualityChecks: true,
        ratings: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
