import { Router, Response } from 'express';
import { prisma } from '../config/db.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { OrderStateMachine } from '../services/orderStateMachine.js';

const router = Router();

router.use(authenticateToken);

// Record Quality Check
router.post('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      orderId,
      batchId,
      expectedQty,
      actualQty,
      damagedQty = 0,
      gradeAssigned,
      remarks,
      photos,
    } = req.body;

    if (!orderId || !batchId || actualQty === undefined || !gradeAssigned) {
      res.status(400).json({ error: 'orderId, batchId, actualQty, and gradeAssigned are required' });
      return;
    }

    const expQty = parseFloat(expectedQty);
    const actQty = parseFloat(actualQty);
    const damQty = parseFloat(damagedQty || '0');
    const acceptedQty = Math.max(0, actQty - damQty);
    const damagePercentage = actQty > 0 ? Math.round((damQty / actQty) * 100 * 10) / 10 : 0;

    let status: 'PASSED' | 'PARTIAL' | 'REJECTED' = 'PASSED';
    if (damagePercentage > 20) {
      status = 'REJECTED';
    } else if (damagePercentage > 5 || damQty > 0) {
      status = 'PARTIAL';
    }

    const qualityCheck = await prisma.qualityCheck.create({
      data: {
        orderId,
        batchId,
        inspectorId: req.user!.id,
        expectedQty: expQty,
        actualQty: actQty,
        damagedQty: damQty,
        acceptedQty,
        gradeAssigned,
        damagePercentage,
        remarks: remarks || `Quality verified at collection center. ${acceptedQty} kg accepted.`,
        photos: photos || null,
        status,
      },
      include: { batch: { include: { product: true } } },
    });

    // Advance order to QUALITY_CHECKED
    await OrderStateMachine.transitionOrder(orderId, 'QUALITY_CHECKED', req.user!.id);

    res.status(201).json({
      message: 'Quality check completed and recorded',
      qualityCheck,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get Quality Check details
router.get('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const qc = await prisma.qualityCheck.findUnique({
      where: { id },
      include: {
        order: { include: { buyer: true } },
        batch: { include: { farmer: { include: { user: true } }, product: true } },
      },
    });

    if (!qc) {
      res.status(404).json({ error: 'Quality check record not found' });
      return;
    }

    res.json(qc);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
