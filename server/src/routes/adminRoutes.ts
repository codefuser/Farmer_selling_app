import { Router, Response } from 'express';
import { prisma } from '../config/db.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

// Admin Dashboard Overview
router.get('/dashboard', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const totalFarmers = await prisma.farmerProfile.count();
    const totalBuyers = await prisma.buyerProfile.count();
    const totalCoordinators = await prisma.coordinatorProfile.count();
    const activeBatches = await prisma.produceBatch.count({ where: { status: 'ACTIVE' } });
    const urgentBatches = await prisma.produceBatch.count({ where: { freshnessStatus: 'URGENT' } });
    const activeDemands = await prisma.buyerDemand.count({ where: { status: 'OPEN' } });
    const totalOrders = await prisma.order.count();
    const completedOrders = await prisma.order.count({ where: { status: 'COMPLETED' } });
    const openDisputes = await prisma.dispute.count({ where: { status: 'OPEN' } });

    const orders = await prisma.order.findMany({
      select: { totalAmount: true, platformFee: true, farmerPayout: true },
    });

    const totalGrossVolume = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const platformRevenue = orders.reduce((sum, o) => sum + o.platformFee, 0);
    const totalFarmerPayout = orders.reduce((sum, o) => sum + o.farmerPayout, 0);

    // Impact Calculations (Prototype Demo Metrics)
    const estimatedWastagePreventedKg = Math.round(activeBatches * 85 + completedOrders * 320);
    const estimatedIntermediaryMarginSaved = Math.round(totalGrossVolume * 0.18); // 18% savings vs middlemen

    res.json({
      counts: {
        totalFarmers,
        totalBuyers,
        totalCoordinators,
        activeBatches,
        urgentBatches,
        activeDemands,
        totalOrders,
        completedOrders,
        openDisputes,
      },
      financials: {
        totalGrossVolume,
        platformRevenue,
        totalFarmerPayout,
      },
      impact: {
        estimatedWastagePreventedKg,
        estimatedIntermediaryMarginSaved,
        collectiveSellingPoolsCount: await prisma.collectiveOrder.count(),
        averageFarmerPriceAdvantagePercent: 22.4, // +22.4% higher net earnings
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Farmers list
router.get('/farmers', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const farmers = await prisma.farmerProfile.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, mobile: true, status: true, createdAt: true } },
        batches: true,
      },
      orderBy: { joinedDate: 'desc' },
    });
    res.json(farmers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Buyers list
router.get('/buyers', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const buyers = await prisma.buyerProfile.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, mobile: true, status: true, createdAt: true } },
        demands: true,
        orders: true,
      },
    });
    res.json(buyers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Batches list
router.get('/listings', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const batches = await prisma.produceBatch.findMany({
      include: {
        product: true,
        farmer: { include: { user: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(batches);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Orders list
router.get('/orders', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        buyer: { include: { user: true } },
        items: { include: { farmer: { include: { user: true } }, batch: { include: { product: true } } } },
        payments: true,
        qualityChecks: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Disputes list
router.get('/disputes', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const disputes = await prisma.dispute.findMany({
      include: {
        order: { include: { buyer: true } },
        raisedByUser: { select: { name: true, role: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(disputes);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Resolve Dispute
router.patch('/disputes/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, resolutionNotes } = req.body;

    const dispute = await prisma.dispute.update({
      where: { id },
      data: {
        status: status || 'RESOLVED',
        resolutionNotes,
      },
    });

    res.json({ message: 'Dispute status updated', dispute });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Suspend / Activate User
router.patch('/users/:id/status', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { status },
    });

    res.json({ message: `User status changed to ${status}`, user });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
