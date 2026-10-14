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

// ==========================================
// ULAVAR2ULAGAM DELIVERY PARTNER PORTAL
// ==========================================

// Get Assigned Deliveries for logged-in Driver
router.get('/my-assignments', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const isSpecialist = req.user!.role === 'LOGISTICS' || req.user!.role === 'ADMIN' || req.user!.role === 'DELIVERY_PARTNER';

    const where: any = {};
    if (!isSpecialist || req.user!.role !== 'ADMIN') {
      where.driverId = userId;
    }

    const assignments = await prisma.deliveryAssignment.findMany({
      where,
      include: {
        order: {
          include: {
            buyer: { include: { user: true } },
            items: { include: { product: true } },
          },
        },
        driver: { select: { id: true, name: true, mobile: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(assignments);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update Assignment Status (PICKED_UP -> OUT_FOR_DELIVERY -> DELIVERED)
router.put('/assignments/:id/status', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, confirmationOtp, failureReason, notes } = req.body;

    const validStatuses = ['ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: `Invalid delivery status. Allowed: ${validStatuses.join(', ')}` });
      return;
    }

    const assignment = await prisma.deliveryAssignment.findUnique({
      where: { id },
      include: { order: true },
    });

    if (!assignment) {
      res.status(404).json({ error: 'Delivery assignment not found.' });
      return;
    }

    const updateData: any = { status };
    if (status === 'PICKED_UP') {
      updateData.pickupTime = new Date();
    }
    if (status === 'DELIVERED') {
      // Validate OTP if provided
      if (confirmationOtp && assignment.confirmationOtp && confirmationOtp !== assignment.confirmationOtp) {
        res.status(400).json({ error: 'Incorrect delivery confirmation OTP. Please check with customer.' });
        return;
      }
      updateData.deliveredTime = new Date();
      updateData.notes = notes || 'Delivered to customer successfully.';
    }
    if (status === 'FAILED') {
      updateData.failureReason = failureReason || 'Customer unreachable / address not found';
    }

    const updated = await prisma.$transaction(async (tx) => {
      const resAssignment = await tx.deliveryAssignment.update({
        where: { id },
        data: updateData,
        include: { driver: true },
      });

      // Synchronize with Order status
      let orderStatus = assignment.order.status;
      if (status === 'PICKED_UP') orderStatus = 'PACKED';
      else if (status === 'OUT_FOR_DELIVERY') orderStatus = 'OUT_FOR_DELIVERY';
      else if (status === 'DELIVERED') orderStatus = 'DELIVERED';

      await tx.order.update({
        where: { id: assignment.orderId },
        data: {
          status: orderStatus,
          ...(status === 'DELIVERED' ? { deliveredAt: new Date() } : {}),
        },
      });

      return resAssignment;
    });

    res.json({ message: `Delivery status updated to ${status}`, assignment: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
