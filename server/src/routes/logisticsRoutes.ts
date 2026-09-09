import { Router, Response } from 'express';
import { prisma } from '../config/db.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { OrderStateMachine } from '../services/orderStateMachine.js';

const router = Router();

router.use(authenticateToken);

// Get Pickup Requests
router.get('/pickups', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const pickups = await prisma.pickupRequest.findMany({
      include: {
        order: {
          include: {
            buyer: { include: { user: true } },
            items: { include: { farmer: { include: { user: true } }, batch: true } },
          },
        },
        center: true,
        vehicle: true,
      },
      orderBy: { scheduledTime: 'desc' },
    });

    res.json(pickups);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create/Schedule Pickup Request
router.post('/pickups', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { orderId, centerId, vehicleId, scheduledTime } = req.body;

    if (!orderId || !centerId) {
      res.status(400).json({ error: 'orderId and centerId are required' });
      return;
    }

    const pickup = await prisma.pickupRequest.create({
      data: {
        orderId,
        centerId,
        vehicleId: vehicleId || null,
        scheduledTime: scheduledTime ? new Date(scheduledTime) : new Date(),
        status: 'SCHEDULED',
      },
      include: { center: true, vehicle: true },
    });

    // Advance order to PICKUP_SCHEDULED
    await OrderStateMachine.transitionOrder(orderId, 'PICKUP_SCHEDULED', req.user!.id);

    res.status(201).json({ message: 'Pickup scheduled successfully', pickup });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update Pickup Request
router.patch('/pickups/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { vehicleId, status } = req.body;

    const updated = await prisma.pickupRequest.update({
      where: { id },
      data: {
        ...(vehicleId ? { vehicleId } : {}),
        ...(status ? { status } : {}),
      },
      include: { order: true },
    });

    if (status === 'COMPLETED') {
      await OrderStateMachine.transitionOrder(updated.orderId, 'COLLECTED', req.user!.id);
    }

    res.json({ message: 'Pickup updated', pickup: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get Deliveries
router.get('/deliveries', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const deliveries = await prisma.delivery.findMany({
      include: {
        order: {
          include: {
            buyer: { include: { user: true } },
            items: { include: { farmer: { include: { user: true } }, batch: true } },
          },
        },
        vehicle: true,
      },
      orderBy: { startedAt: 'desc' },
    });

    res.json(deliveries);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update Delivery status / GPS simulation
router.patch('/deliveries/:id/status', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, currentLat, currentLng } = req.body;

    const delivery = await prisma.delivery.findUnique({
      where: { id },
    });

    if (!delivery) {
      res.status(404).json({ error: 'Delivery not found' });
      return;
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (currentLat !== undefined) updateData.currentLat = currentLat;
    if (currentLng !== undefined) updateData.currentLng = currentLng;
    if (status === 'IN_TRANSIT' && !delivery.startedAt) updateData.startedAt = new Date();
    if (status === 'DELIVERED') updateData.completedAt = new Date();

    const updated = await prisma.delivery.update({
      where: { id },
      data: updateData,
    });

    if (status === 'IN_TRANSIT') {
      await OrderStateMachine.transitionOrder(delivery.orderId, 'DISPATCHED', req.user!.id);
    } else if (status === 'DELIVERED') {
      await OrderStateMachine.transitionOrder(delivery.orderId, 'DELIVERED', req.user!.id);
    }

    res.json({ message: 'Delivery status updated', delivery: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get Vehicles
router.get('/vehicles', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const vehicles = await prisma.vehicle.findMany();
    res.json(vehicles);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get Collection Centers
router.get('/collection-centers', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const centers = await prisma.collectionCenter.findMany({
      include: { coordinator: { include: { user: true } } },
    });
    res.json(centers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
