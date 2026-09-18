import { Router, Response } from 'express';
import { prisma } from '../config/db.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

// 1. Get user's price alerts
router.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const alerts = await prisma.priceAlert.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            marketPrices: {
              orderBy: { date: 'desc' },
              take: 1,
            },
            batches: {
              where: { status: 'ACTIVE', quantity: { gt: 0 } },
              select: { pricePerKg: true },
              orderBy: { pricePerKg: 'asc' },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = alerts.map((a) => {
      const lowestFarmerPrice = a.product.batches[0]?.pricePerKg || null;
      const latestMandiPrice = a.product.marketPrices[0]?.modalPrice || null;

      return {
        id: a.id,
        productId: a.productId,
        productName: a.product.name,
        productNameTamil: a.product.nameTamil,
        targetPrice: a.targetPrice,
        condition: a.condition,
        district: a.district,
        isActive: a.isActive,
        triggeredAt: a.triggeredAt,
        createdAt: a.createdAt,
        currentMarket: {
          lowestFarmerPrice,
          latestMandiPrice,
          isTriggered:
            lowestFarmerPrice !== null &&
            (a.condition === 'LESS_THAN_EQUAL'
              ? lowestFarmerPrice <= a.targetPrice
              : lowestFarmerPrice >= a.targetPrice),
        },
      };
    });

    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Create price alert
router.post('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { productId, targetPrice, condition = 'LESS_THAN_EQUAL', district } = req.body;

    if (!productId || !targetPrice || targetPrice <= 0) {
      res.status(400).json({ error: 'Product ID and valid target price are required' });
      return;
    }

    const alert = await prisma.priceAlert.create({
      data: {
        userId,
        productId,
        targetPrice: parseFloat(String(targetPrice)),
        condition,
        district: district || null,
      },
      include: {
        product: true,
      },
    });

    res.status(201).json({
      success: true,
      message: `Price alert set for ${alert.product.name} at ₹${alert.targetPrice}/kg`,
      alert,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Delete price alert
router.delete('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    await prisma.priceAlert.deleteMany({
      where: { id, userId },
    });

    res.json({ success: true, message: 'Price alert removed' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
