import { Router, Response } from 'express';
import { prisma } from '../config/db.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { PaymentService } from '../services/paymentService.js';

const router = Router();

router.use(authenticateToken);

// Create Mock Payment Authorization
router.post('/create', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { orderId, buyerId, paymentMethod } = req.body;
    if (!orderId || !buyerId) {
      res.status(400).json({ error: 'orderId and buyerId required' });
      return;
    }

    const payment = await PaymentService.authorizePayment(orderId, buyerId, paymentMethod || 'MOCK_UPI');
    res.status(201).json({ message: 'Payment authorized and held in escrow', payment });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Mock UPI Success Callback / Escrow Release
router.post('/release/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const payment = await PaymentService.releasePayment(id);
    res.json({ message: 'Escrow payment released to farmers', payment });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get Payment Details
router.get('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        order: { include: { items: { include: { farmer: { include: { user: true } } } } } },
        payouts: { include: { farmer: { include: { user: true } } } },
      },
    });

    if (!payment) {
      res.status(404).json({ error: 'Payment not found' });
      return;
    }

    res.json(payment);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
