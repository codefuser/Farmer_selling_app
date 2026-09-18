import { Router, Response } from 'express';
import { prisma } from '../config/db.js';
import { authenticateToken, AuthenticatedRequest, requireRole } from '../middleware/auth.js';
import { FreshnessService } from '../services/freshnessService.js';
import { ProfitCalculationService } from '../services/profitCalculationService.js';

const router = Router();

// Middleware: Farmer or Admin or Coordinator
router.use(authenticateToken);

// Helper to get farmer profile
async function getFarmerProfile(userId: string) {
  return await prisma.farmerProfile.findUnique({
    where: { userId },
    include: { user: true },
  });
}

// Products Catalog & Fair Price Reference
router.get('/products', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const products = await prisma.product.findMany({
      include: {
        freshnessRules: true,
        marketPrices: {
          orderBy: { date: 'desc' },
          take: 1,
        },
      },
    });
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Farmer Dashboard Overview
router.get('/dashboard', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const farmer = await getFarmerProfile(req.user!.id);
    if (!farmer) {
      res.status(404).json({ error: 'Farmer profile not found' });
      return;
    }

    // Refresh freshness for active batches
    await FreshnessService.evaluateAllActiveBatches();

    const batches = await prisma.produceBatch.findMany({
      where: { farmerId: farmer.id },
      include: {
        product: { include: { freshnessRules: true } },
      },
    });

    const activeBatches = batches.filter((b) => b.status === 'ACTIVE' || b.status === 'RESERVED');
    const freshBatches = activeBatches.filter((b) => b.freshnessStatus === 'FRESH');
    const agingBatches = activeBatches.filter((b) => b.freshnessStatus === 'AGING');
    const urgentBatches = activeBatches.filter((b) => b.freshnessStatus === 'URGENT');
    const expiredBatches = batches.filter((b) => b.freshnessStatus === 'EXPIRED' || b.status === 'EXPIRED');

    const totalQuantity = activeBatches.reduce((acc, b) => acc + b.quantity, 0);

    const pendingOffers = await prisma.offer.count({
      where: {
        farmerId: farmer.id,
        status: 'PENDING',
      },
    });

    const activeOrders = await prisma.orderItem.count({
      where: {
        farmerId: farmer.id,
        order: {
          status: { in: ['ORDERED', 'ACCEPTED', 'PICKUP_SCHEDULED', 'COLLECTED', 'QUALITY_CHECKED', 'PACKED', 'DISPATCHED'] },
        },
      },
    });

    // Real Payouts & Earnings calculation
    const financials = await ProfitCalculationService.getFarmerFinancials(farmer.id);

    res.json({
      farmer: {
        name: req.user!.name,
        farmerId: farmer.farmerId,
        village: farmer.village,
        district: farmer.district,
        rating: farmer.rating,
        completedOrders: farmer.completedOrders,
        verified: farmer.verified,
        verificationStatus: farmer.verificationStatus || 'VERIFIED',
      },
      stats: {
        activeBatchesCount: activeBatches.length,
        freshBatchesCount: freshBatches.length,
        agingBatchesCount: agingBatches.length,
        urgentBatchesCount: urgentBatches.length,
        expiredBatchesCount: expiredBatches.length,
        totalAvailableQuantityKg: totalQuantity,
        pendingOffersCount: pendingOffers,
        activeOrdersCount: activeOrders,
        todayEarnings: financials.todayEarnings,
        totalEarnings: financials.totalRevenue,
        pendingPayouts: financials.pendingPayouts,
        totalCosts: financials.totalCosts,
        netProfit: financials.netProfit,
        profitMargin: financials.profitMargin,
      },
      recentBatches: activeBatches.slice(0, 4).map((b) => ({
        ...b,
        freshness: FreshnessService.calculateFreshness(b.harvestedAt, b.sellBy, b.product.freshnessRules[0]),
      })),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create Produce Batch (Add Produce)
router.post('/batches', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const farmer = await getFarmerProfile(req.user!.id);
    if (!farmer) {
      res.status(404).json({ error: 'Farmer profile not found' });
      return;
    }

    const {
      productId,
      quantity,
      pricePerKg,
      qualityGrade = 'A',
      harvestedAt,
      sellBy,
      imageUrl,
      notes,
    } = req.body;

    if (!productId || !quantity || !pricePerKg || !sellBy) {
      res.status(400).json({ error: 'Product, quantity, price, and sell-by time are required' });
      return;
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { freshnessRules: true },
    });

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const harvestDate = harvestedAt ? new Date(harvestedAt) : new Date();
    const sellByDate = new Date(sellBy);

    // Initial freshness calculation
    const freshness = FreshnessService.calculateFreshness(harvestDate, sellByDate, product.freshnessRules[0]);

    // Generate unique batch code
    const shortCode = product.name.slice(0, 3).toUpperCase();
    const batchCount = await prisma.produceBatch.count();
    const batchCode = `${shortCode}-${new Date().getFullYear()}-${String(batchCount + 1).padStart(5, '0')}`;

    const batch = await prisma.produceBatch.create({
      data: {
        batchCode,
        farmerId: farmer.id,
        productId,
        quantity: parseFloat(quantity),
        initialQuantity: parseFloat(quantity),
        pricePerKg: parseFloat(pricePerKg),
        qualityGrade,
        harvestedAt: harvestDate,
        sellBy: sellByDate,
        freshnessStatus: freshness.status,
        status: freshness.status === 'EXPIRED' ? 'EXPIRED' : 'ACTIVE',
        village: farmer.village,
        district: farmer.district,
        imageUrl: imageUrl || product.imageUrl,
        notes,
      },
      include: { product: true, images: true },
    });

    if (imageUrl) {
      await prisma.productImage.create({
        data: {
          batchId: batch.id,
          imageUrl,
          isPrimary: true,
        },
      }).catch(console.error);
    }

    res.status(201).json({
      message: 'Produce batch published successfully',
      batch: {
        ...batch,
        freshness,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// List Farmer Batches
router.get('/batches', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const farmer = await getFarmerProfile(req.user!.id);
    if (!farmer) {
      res.status(404).json({ error: 'Farmer profile not found' });
      return;
    }

    const batches = await prisma.produceBatch.findMany({
      where: { farmerId: farmer.id },
      include: {
        product: { include: { freshnessRules: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = batches.map((batch) => {
      const freshness = FreshnessService.calculateFreshness(
        batch.harvestedAt,
        batch.sellBy,
        batch.product.freshnessRules[0]
      );
      return {
        ...batch,
        freshness,
      };
    });

    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Farmer Offers
router.get('/offers', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const farmer = await getFarmerProfile(req.user!.id);
    if (!farmer) {
      res.status(404).json({ error: 'Farmer profile not found' });
      return;
    }

    const offers = await prisma.offer.findMany({
      where: { farmerId: farmer.id },
      include: {
        buyer: { include: { user: true } },
        batch: { include: { product: true } },
        demand: true,
        history: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(offers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Accept Offer
router.patch('/offers/:id/accept', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const offer = await prisma.offer.findUnique({
      where: { id },
      include: { batch: true, demand: true, buyer: { include: { user: true } } },
    });

    if (!offer) {
      res.status(404).json({ error: 'Offer not found' });
      return;
    }

    if (offer.batch.quantity < offer.quantity) {
      res.status(400).json({ error: 'Insufficient batch quantity remaining to accept this offer' });
      return;
    }

    // Update offer status
    const updatedOffer = await prisma.offer.update({
      where: { id },
      data: { status: 'ACCEPTED' },
    });

    // Notify Buyer
    await prisma.notification.create({
      data: {
        userId: offer.buyer.userId,
        title: 'Farmer Accepted Your Offer!',
        message: `Farmer accepted your offer of ₹${offer.offeredPricePerKg}/kg for ${offer.quantity} kg of ${offer.batch.batchCode}.`,
        type: 'OFFER_ACCEPTED',
      },
    });

    res.json({ message: 'Offer accepted successfully', offer: updatedOffer });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Reject Offer
router.patch('/offers/:id/reject', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updatedOffer = await prisma.offer.update({
      where: { id },
      data: { status: 'REJECTED' },
    });

    res.json({ message: 'Offer rejected', offer: updatedOffer });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Counter Offer
router.post('/offers/:id/counter', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { counterPricePerKg, notes } = req.body;

    if (!counterPricePerKg) {
      res.status(400).json({ error: 'Counter price per kg required' });
      return;
    }

    const offer = await prisma.offer.findUnique({
      where: { id },
      include: { buyer: { include: { user: true } }, batch: true },
    });

    if (!offer) {
      res.status(404).json({ error: 'Offer not found' });
      return;
    }

    // Update offer
    const updatedOffer = await prisma.offer.update({
      where: { id },
      data: {
        status: 'COUNTERED',
        isCounterOffer: true,
        offeredPricePerKg: parseFloat(counterPricePerKg),
      },
    });

    // Record offer history
    await prisma.offerHistory.create({
      data: {
        offerId: id,
        proposedByUserId: req.user!.id,
        pricePerKg: parseFloat(counterPricePerKg),
        notes: notes || `Farmer proposed counter-price of ₹${counterPricePerKg}/kg`,
      },
    });

    // Notify Buyer
    await prisma.notification.create({
      data: {
        userId: offer.buyer.userId,
        title: 'New Counter-Offer from Farmer',
        message: `Farmer proposed counter-price ₹${counterPricePerKg}/kg for batch ${offer.batch.batchCode}.`,
        type: 'COUNTER_OFFER',
      },
    });

    res.json({ message: 'Counter-offer sent to buyer', offer: updatedOffer });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Farmer Orders
router.get('/orders', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const farmer = await getFarmerProfile(req.user!.id);
    if (!farmer) {
      res.status(404).json({ error: 'Farmer profile not found' });
      return;
    }

    const orderItems = await prisma.orderItem.findMany({
      where: { farmerId: farmer.id },
      include: {
        order: {
          include: {
            buyer: { include: { user: true } },
            deliveries: { include: { vehicle: true } },
            qualityChecks: true,
          },
        },
        batch: { include: { product: true } },
      },
      orderBy: { order: { createdAt: 'desc' } },
    });

    res.json(orderItems);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Farmer Collective Selling Pools
router.get('/collective-pools', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const farmer = await getFarmerProfile(req.user!.id);
    if (!farmer) {
      res.status(404).json({ error: 'Farmer profile not found' });
      return;
    }

    const members = await prisma.collectiveOrderMember.findMany({
      where: { farmerId: farmer.id },
      include: {
        collectiveOrder: {
          include: {
            demand: { include: { buyer: { include: { user: true } }, product: true } },
            orders: true,
          },
        },
        batch: true,
      },
    });

    res.json(members);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Farmer Earnings
router.get('/earnings', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const farmer = await getFarmerProfile(req.user!.id);
    if (!farmer) {
      res.status(404).json({ error: 'Farmer profile not found' });
      return;
    }

    const payouts = await prisma.farmerPayout.findMany({
      where: { farmerId: farmer.id },
      include: {
        payment: { include: { order: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Real financial computation using ProfitCalculationService
    const financials = await ProfitCalculationService.getFarmerFinancials(farmer.id);

    res.json({
      summary: {
        totalEarnings: financials.totalRevenue,
        pendingPayouts: financials.pendingPayouts,
        todayEarnings: financials.todayEarnings,
        totalCosts: financials.totalCosts,
        netProfit: financials.netProfit,
        profitMargin: financials.profitMargin,
        completedOrdersCount: farmer.completedOrders,
        platformFeeSavedComparedToMiddlemen: Math.round(financials.totalRevenue * 0.18), // 18% savings vs traditional APMC middlemen
      },
      payouts,
      costByCategory: financials.costByCategory,
      chart: financials.monthlyData,
      recentCosts: financials.recentCosts,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Public Farmer Profile (accessible by consumers & fellow farmers)
router.get('/:id/public-profile', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const farmer = await prisma.farmerProfile.findFirst({
      where: {
        OR: [{ id }, { userId: id }],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            mobile: true,
            createdAt: true,
          },
        },
        batches: {
          where: { status: 'ACTIVE', quantity: { gt: 0 } },
          include: {
            product: { include: { freshnessRules: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        posts: {
          where: { status: 'ACTIVE' },
          include: {
            media: { orderBy: { orderIndex: 'asc' } },
            _count: { select: { likes: true, comments: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!farmer) {
      res.status(404).json({ error: 'Farmer profile not found' });
      return;
    }

    const reviews = await prisma.rating.findMany({
      where: { toUserId: farmer.userId },
      include: {
        fromUser: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 15,
    });

    res.json({
      farmer: {
        id: farmer.id,
        userId: farmer.userId,
        farmerId: farmer.farmerId,
        name: farmer.user.name,
        avatarUrl: farmer.user.avatarUrl,
        village: farmer.village,
        district: farmer.district,
        state: farmer.state,
        landSize: farmer.landSize,
        farmingType: farmer.farmingType || 'Conventional',
        mainCrops: farmer.mainCrops || 'Tomato, Brinjal, Onion',
        experienceYears: farmer.experienceYears || 5,
        bio: farmer.bio || `Passionate farmer from ${farmer.village}, dedicated to providing fresh harvests directly to buyers.`,
        rating: farmer.rating,
        completedOrders: farmer.completedOrders,
        verified: farmer.verified,
        identityVerificationStatus: farmer.identityVerificationStatus,
        farmVerificationStatus: farmer.farmVerificationStatus,
        joinedDate: farmer.joinedDate,
      },
      produceBatches: farmer.batches,
      posts: farmer.posts.map((p) => ({
        ...p,
        likeCount: p._count.likes,
        commentCount: p._count.comments,
      })),
      reviews,
    });
  } catch (err: any) {
    console.error('Farmer public profile error:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch farmer profile' });
  }
});

// --- Phase 2: Cost Tracking (Profit & Loss Engine) ---

// Get all input costs for current farmer
router.get('/costs', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const farmer = await getFarmerProfile(req.user!.id);
    if (!farmer) {
      res.status(404).json({ error: 'Farmer profile not found' });
      return;
    }

    const costs = await prisma.farmerCost.findMany({
      where: { farmerId: farmer.id },
      include: {
        batch: {
          include: { product: true },
        },
      },
      orderBy: { date: 'desc' },
    });

    const total = costs.reduce((sum, c) => sum + c.amount, 0);

    res.json({
      costs,
      totalCosts: total,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Add an input cost
router.post('/costs', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const farmer = await getFarmerProfile(req.user!.id);
    if (!farmer) {
      res.status(404).json({ error: 'Farmer profile not found' });
      return;
    }

    const { category, amount, description, batchId, date } = req.body;

    if (!category || !amount || amount <= 0) {
      res.status(400).json({ error: 'Category and positive amount are required' });
      return;
    }

    const validCategories = ['SEED', 'FERTILIZER', 'PESTICIDE', 'LABOR', 'TRANSPORT', 'IRRIGATION', 'MACHINERY', 'OTHER'];
    if (!validCategories.includes(category)) {
      res.status(400).json({ error: `Invalid category. Must be one of: ${validCategories.join(', ')}` });
      return;
    }

    const cost = await prisma.farmerCost.create({
      data: {
        farmerId: farmer.id,
        category,
        amount: parseFloat(amount),
        description: description?.trim() || null,
        batchId: batchId || null,
        date: date ? new Date(date) : new Date(),
      },
    });

    res.status(201).json({
      success: true,
      message: 'Cost record saved',
      cost,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete an input cost
router.delete('/costs/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const farmer = await getFarmerProfile(req.user!.id);
    if (!farmer) {
      res.status(404).json({ error: 'Farmer profile not found' });
      return;
    }

    const { id } = req.params;
    const existing = await prisma.farmerCost.findUnique({ where: { id } });

    if (!existing) {
      res.status(404).json({ error: 'Cost record not found' });
      return;
    }

    if (existing.farmerId !== farmer.id && req.user!.role !== 'ADMIN') {
      res.status(403).json({ error: 'Unauthorized to delete this cost' });
      return;
    }

    await prisma.farmerCost.delete({ where: { id } });

    res.json({ success: true, message: 'Cost record deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Phase 2: Farmer Reputation & Dimension Scores ---

// Get reputation summary for a farmer
router.get('/:id/reputation', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const farmer = await prisma.farmerProfile.findFirst({
      where: { OR: [{ id }, { userId: id }] },
      include: { user: true },
    });

    if (!farmer) {
      res.status(404).json({ error: 'Farmer not found' });
      return;
    }

    const ratings = await prisma.rating.findMany({
      where: { toUserId: farmer.userId },
      include: {
        fromUser: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalRatings = ratings.length;
    let avgOverall = farmer.rating;
    let avgQuality = 0;
    let avgFreshness = 0;
    let avgAccuracy = 0;
    let avgCommunication = 0;

    let qCount = 0, fCount = 0, aCount = 0, cCount = 0;

    for (const r of ratings) {
      if (r.qualityScore) { avgQuality += r.qualityScore; qCount++; }
      if (r.freshnessScore) { avgFreshness += r.freshnessScore; fCount++; }
      if (r.accuracyScore) { avgAccuracy += r.accuracyScore; aCount++; }
      if (r.communicationScore) { avgCommunication += r.communicationScore; cCount++; }
    }

    res.json({
      farmerId: farmer.id,
      farmerName: farmer.user.name,
      verified: farmer.verified,
      verificationStatus: farmer.verificationStatus || 'VERIFIED',
      completedOrders: farmer.completedOrders,
      totalReviews: totalRatings,
      overallRating: avgOverall,
      dimensionScores: {
        quality: qCount > 0 ? Math.round((avgQuality / qCount) * 10) / 10 : avgOverall,
        freshness: fCount > 0 ? Math.round((avgFreshness / fCount) * 10) / 10 : avgOverall,
        accuracy: aCount > 0 ? Math.round((avgAccuracy / aCount) * 10) / 10 : avgOverall,
        communication: cCount > 0 ? Math.round((avgCommunication / cCount) * 10) / 10 : avgOverall,
      },
      recentReviews: ratings.slice(0, 10),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Phase 2: Farmer Follow / Unfollow ---

router.post('/:id/follow', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // farmerProfile id or userId
    const userId = req.user!.id;

    const farmer = await prisma.farmerProfile.findFirst({
      where: { OR: [{ id }, { userId: id }] },
    });

    if (!farmer) {
      res.status(404).json({ error: 'Farmer profile not found' });
      return;
    }

    if (farmer.userId === userId) {
      res.status(400).json({ error: 'You cannot follow yourself' });
      return;
    }

    const follow = await prisma.farmerFollow.upsert({
      where: {
        followerId_farmerId: {
          followerId: userId,
          farmerId: farmer.id,
        },
      },
      update: {},
      create: {
        followerId: userId,
        farmerId: farmer.id,
      },
    });

    res.json({ success: true, message: 'Followed farmer successfully', follow });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/unfollow', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const farmer = await prisma.farmerProfile.findFirst({
      where: { OR: [{ id }, { userId: id }] },
    });

    if (!farmer) {
      res.status(404).json({ error: 'Farmer profile not found' });
      return;
    }

    await prisma.farmerFollow.deleteMany({
      where: {
        followerId: userId,
        farmerId: farmer.id,
      },
    });

    res.json({ success: true, message: 'Unfollowed farmer successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
