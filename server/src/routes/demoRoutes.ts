import { Router, Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { FreshnessService } from '../services/freshnessService.js';
import { NotificationService } from '../services/notificationService.js';

const router = Router();

// Demo Scenario 2: Simulate Freshness Decay and Urgent Sale Mode
router.post('/simulate-urgency', async (req: Request, res: Response): Promise<void> => {
  try {
    const { batchId } = req.body;

    // Find target batch or latest fresh batch
    let batch = batchId 
      ? await prisma.produceBatch.findUnique({ where: { id: batchId }, include: { product: true } })
      : await prisma.produceBatch.findFirst({
          where: { freshnessStatus: 'FRESH', status: 'ACTIVE' },
          include: { product: true, farmer: { include: { user: true } } },
        });

    if (!batch) {
      res.status(404).json({ error: 'No suitable active batch found for demo' });
      return;
    }

    // Set sellBy to 45 minutes from now (triggering URGENT SALE status)
    const now = new Date();
    const urgentSellBy = new Date(now.getTime() + 45 * 60 * 1000); // 45 minutes remaining

    const updatedBatch = await prisma.produceBatch.update({
      where: { id: batch.id },
      data: {
        sellBy: urgentSellBy,
        freshnessStatus: 'URGENT',
        pricePerKg: Math.round(batch.pricePerKg * 0.85), // 15% discount
      },
      include: { product: true, farmer: { include: { user: true } } },
    });

    // Notify the farmer
    await prisma.notification.create({
      data: {
        userId: updatedBatch.farmer.user.id,
        title: '⚠️ Produce Freshness Alert: Urgent Sale Activated!',
        message: `Your batch ${updatedBatch.batchCode} (${updatedBatch.product.name}) has entered Urgent Sale mode. 45 minutes remaining before expiry. Price adjusted to ₹${updatedBatch.pricePerKg}/kg to prioritize quick movement.`,
        type: 'URGENT_SALE',
        channel: 'IN_APP',
      },
    });

    // Broadcast urgent sale to nearby B2B buyers
    await NotificationService.broadcastUrgentSale(updatedBatch);

    res.json({
      message: 'Urgent sale mode activated. Notifications dispatched to farmer and nearby B2B buyers.',
      batch: updatedBatch,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Demo Scenario 2 Expiry Trigger: Mark a batch as EXPIRED
router.post('/simulate-expiry', async (req: Request, res: Response): Promise<void> => {
  try {
    const { batchId } = req.body;

    let batch = batchId 
      ? await prisma.produceBatch.findUnique({ where: { id: batchId }, include: { product: true, farmer: { include: { user: true } } } })
      : await prisma.produceBatch.findFirst({
          where: { freshnessStatus: 'URGENT', status: 'ACTIVE' },
          include: { product: true, farmer: { include: { user: true } } },
        });

    if (!batch) {
      res.status(404).json({ error: 'No urgent batch found' });
      return;
    }

    const updated = await prisma.produceBatch.update({
      where: { id: batch.id },
      data: {
        freshnessStatus: 'EXPIRED',
        status: 'EXPIRED',
      },
    });

    // Farmer notification
    await prisma.notification.create({
      data: {
        userId: batch.farmer.user.id,
        title: '🛑 Batch Expired from Marketplace',
        message: `Your batch ${batch.batchCode} (${batch.product.name}) has passed its sell-by deadline and is no longer available on the active marketplace. Recommendation: Contact local bio-compost or animal feed processing centers.`,
        type: 'LISTING_EXPIRED',
      },
    });

    res.json({
      message: 'Batch marked as EXPIRED. Marketplace listing deactivated.',
      batch: updated,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
