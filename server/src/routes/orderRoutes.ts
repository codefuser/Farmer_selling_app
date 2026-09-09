import { Router, Response } from 'express';
import { prisma } from '../config/db.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { OrderStateMachine, OrderStatus } from '../services/orderStateMachine.js';

const router = Router();

router.use(authenticateToken);

// Get Order By ID with complete details
router.get('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        buyer: { include: { user: true } },
        collectiveOrder: {
          include: {
            members: {
              include: {
                farmer: { include: { user: true } },
                batch: { include: { product: true } },
              },
            },
          },
        },
        items: {
          include: {
            farmer: { include: { user: true } },
            batch: { include: { product: true } },
          },
        },
        qualityChecks: true,
        pickupRequests: { include: { center: true, vehicle: true } },
        deliveries: { include: { vehicle: true } },
        payments: true,
        ratings: true,
        disputes: true,
      },
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    res.json(order);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Advance Order Status (Order State Machine)
router.patch('/:id/status', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nextStatus, details } = req.body;

    if (!nextStatus) {
      res.status(400).json({ error: 'nextStatus is required' });
      return;
    }

    const updatedOrder = await OrderStateMachine.transitionOrder(
      id,
      nextStatus as OrderStatus,
      req.user!.id,
      details
    );

    res.json({
      message: `Order transitioned to ${nextStatus}`,
      order: updatedOrder,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Raise Dispute on an Order
router.post('/:id/dispute', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason, evidenceJson } = req.body;

    if (!reason) {
      res.status(400).json({ error: 'Dispute reason is required' });
      return;
    }

    const dispute = await prisma.dispute.create({
      data: {
        orderId: id,
        raisedByUserId: req.user!.id,
        reason,
        evidenceJson: evidenceJson ? JSON.stringify(evidenceJson) : null,
        status: 'OPEN',
      },
    });

    res.status(201).json({ message: 'Dispute registered with admin team', dispute });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
