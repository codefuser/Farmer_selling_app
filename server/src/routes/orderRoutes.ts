import { Router, Response } from 'express';
import { prisma } from '../config/db.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { OrderStateMachine, OrderStatus } from '../services/orderStateMachine.js';
import { RealtimeService } from '../services/realtimeService.js';
import { NotificationService } from '../services/notificationService.js';

const router = Router();

router.use(authenticateToken);

// 1. Get Order By ID with complete details
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
        ratings: {
          include: {
            fromUser: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
        disputes: true,
        cancellation: true,
        refunds: true,
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

// 2. Farmer Accepts Order
router.post('/:id/accept', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { farmer: true } },
        buyer: { include: { user: true } },
      },
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    // IDOR Check: Authenticated user must be a farmer of this order (or ADMIN)
    const isOwnerFarmer = order.items.some((item) => item.farmer.userId === userId);
    if (!isOwnerFarmer && req.user!.role !== 'ADMIN') {
      res.status(403).json({ error: 'Unauthorized: You are not a seller for this order.' });
      return;
    }

    if (order.status !== 'ORDERED') {
      res.status(400).json({ error: `Cannot accept order currently in ${order.status} state` });
      return;
    }

    // Transition order to ACCEPTED
    const updatedOrder = await OrderStateMachine.transitionOrder(id, 'ACCEPTED', userId, {
      acceptedByFarmerId: userId,
      acceptedAt: new Date().toISOString(),
    });

    // Notify Buyer
    await NotificationService.notify({
      userId: order.buyer.userId,
      title: `Order Accepted: #${order.orderCode}`,
      message: `The farmer has confirmed your order. Dispatch preparations will begin shortly.`,
      type: 'ORDER_ACCEPTED',
      metadata: { orderId: order.id, orderCode: order.orderCode },
    });

    res.json({
      success: true,
      message: 'Order accepted successfully',
      order: updatedOrder,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Farmer Rejects Order
router.post('/:id/reject', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason = 'Farmer unavailable or stock issue' } = req.body;
    const userId = req.user!.id;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { farmer: true } },
        buyer: { include: { user: true } },
        payments: true,
      },
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    const isOwnerFarmer = order.items.some((item) => item.farmer.userId === userId);
    if (!isOwnerFarmer && req.user!.role !== 'ADMIN') {
      res.status(403).json({ error: 'Unauthorized: You are not a seller for this order.' });
      return;
    }

    if (order.status !== 'ORDERED') {
      res.status(400).json({ error: `Cannot reject order currently in ${order.status} state` });
      return;
    }

    // Execute rejection in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Restore inventory
      for (const item of order.items) {
        await tx.produceBatch.update({
          where: { id: item.batchId },
          data: {
            quantity: { increment: item.quantity },
            status: 'ACTIVE',
          },
        });
      }

      // Record cancellation
      const cancellation = await tx.orderCancellation.create({
        data: {
          orderId: order.id,
          cancelledByUserId: userId,
          reason,
          comments: 'Rejected by farmer before dispatch',
        },
      });

      // Update Order
      const updated = await tx.order.update({
        where: { id: order.id },
        data: {
          status: 'CANCELLED',
          cancellationReason: reason,
          cancelledBy: 'FARMER',
          cancelledAt: new Date(),
        },
      });

      // Process refund for authorized payments
      for (const payment of order.payments) {
        if (payment.status === 'AUTHORIZED') {
          await tx.payment.update({
            where: { id: payment.id },
            data: { status: 'REFUNDED' },
          });

          await tx.refund.create({
            data: {
              paymentId: payment.id,
              orderId: order.id,
              amount: payment.amount,
              reason: 'Farmer rejected order',
              status: 'PROCESSED',
              refundRef: `REF-${Date.now().toString().slice(-8)}`,
            },
          });
        }
      }

      return { updated, cancellation };
    });

    // Notify Buyer
    await NotificationService.notify({
      userId: order.buyer.userId,
      title: `Order Rejected: #${order.orderCode}`,
      message: `The farmer could not fulfill order #${order.orderCode}: ${reason}. Any authorized amount has been refunded.`,
      type: 'ORDER_REJECTED',
      metadata: { orderId: order.id, reason },
    });

    RealtimeService.sendToUser(order.buyer.userId, 'order_status_update', {
      orderId: order.id,
      orderCode: order.orderCode,
      status: 'CANCELLED',
      reason,
    });

    res.json({
      success: true,
      message: 'Order rejected and inventory restored',
      order: result.updated,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Cancel Order (Buyer or Admin)
router.post('/:id/cancel', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason = 'Cancelled by buyer' } = req.body;
    const userId = req.user!.id;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        buyer: true,
        items: { include: { farmer: { include: { user: true } } } },
        payments: true,
      },
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    const isBuyer = order.buyer.userId === userId;
    const isAdmin = req.user!.role === 'ADMIN';

    if (!isBuyer && !isAdmin) {
      res.status(403).json({ error: 'Unauthorized to cancel this order.' });
      return;
    }

    // Cancellation policy: Only allowed in ORDERED or ACCEPTED state
    if (!['ORDERED', 'ACCEPTED'].includes(order.status)) {
      res.status(400).json({
        error: `Cannot cancel order in ${order.status} stage. Dispatched or transit orders cannot be cancelled directly.`,
      });
      return;
    }

    // Process cancellation transactionally
    const cancelled = await prisma.$transaction(async (tx) => {
      // 1. Restock batch quantities
      for (const item of order.items) {
        await tx.produceBatch.update({
          where: { id: item.batchId },
          data: {
            quantity: { increment: item.quantity },
            status: 'ACTIVE',
          },
        });
      }

      // 2. Cancellation audit record
      await tx.orderCancellation.create({
        data: {
          orderId: order.id,
          cancelledByUserId: userId,
          reason,
          comments: isBuyer ? 'Cancelled by buyer before pickup' : 'Cancelled by administrator',
        },
      });

      // 3. Mark Order as CANCELLED
      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          status: 'CANCELLED',
          cancellationReason: reason,
          cancelledBy: isBuyer ? 'BUYER' : 'ADMIN',
          cancelledAt: new Date(),
        },
      });

      // 4. Refund authorized payments
      for (const payment of order.payments) {
        if (payment.status === 'AUTHORIZED') {
          await tx.payment.update({
            where: { id: payment.id },
            data: { status: 'REFUNDED' },
          });

          await tx.refund.create({
            data: {
              paymentId: payment.id,
              orderId: order.id,
              amount: payment.amount,
              reason: `Order cancelled by ${isBuyer ? 'buyer' : 'admin'}`,
              status: 'PROCESSED',
              refundRef: `REF-${Date.now().toString().slice(-8)}`,
            },
          });
        }
      }

      return updatedOrder;
    });

    // Notify farmers
    for (const item of order.items) {
      await NotificationService.notify({
        userId: item.farmer.userId,
        title: `Order Cancelled: #${order.orderCode}`,
        message: `Order #${order.orderCode} was cancelled by buyer (${reason}). Produce inventory has been restored.`,
        type: 'ORDER_CANCELLED',
        metadata: { orderId: order.id, reason },
      });

      RealtimeService.sendToUser(item.farmer.userId, 'order_status_update', {
        orderId: order.id,
        orderCode: order.orderCode,
        status: 'CANCELLED',
        reason,
      });
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully and inventory restored',
      order: cancelled,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Get Real-time Tracking Details
router.get('/:id/tracking', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        deliveries: {
          include: {
            vehicle: true,
          },
        },
        items: {
          include: {
            farmer: { include: { user: true } },
            batch: { include: { product: true } },
          },
        },
        pickupRequests: {
          include: {
            center: true,
            vehicle: true,
          },
        },
        buyer: true,
      },
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    const activeDelivery = order.deliveries[0] || null;

    // Build milestone progress
    const milestones = [
      { step: 'ORDERED', label: 'Order Placed', completed: true, timestamp: order.createdAt },
      {
        step: 'ACCEPTED',
        label: 'Farmer Confirmed',
        completed: ['ACCEPTED', 'PICKUP_SCHEDULED', 'COLLECTED', 'QUALITY_CHECKED', 'PACKED', 'DISPATCHED', 'DELIVERED', 'PAYMENT_RELEASED', 'COMPLETED'].includes(order.status),
      },
      {
        step: 'DISPATCHED',
        label: 'Dispatched for Delivery',
        completed: ['DISPATCHED', 'DELIVERED', 'PAYMENT_RELEASED', 'COMPLETED'].includes(order.status),
      },
      {
        step: 'DELIVERED',
        label: 'Delivered to Destination',
        completed: ['DELIVERED', 'PAYMENT_RELEASED', 'COMPLETED'].includes(order.status),
        timestamp: order.deliveredAt,
      },
      {
        step: 'PAYMENT_RELEASED',
        label: 'Payment Released to Farmer',
        completed: ['PAYMENT_RELEASED', 'COMPLETED'].includes(order.status),
      },
    ];

    res.json({
      orderId: order.id,
      orderCode: order.orderCode,
      status: order.status,
      deliveryMethod: order.deliveryMethod || 'STANDARD',
      deliveryFee: order.deliveryFee || 0,
      deliveryAddress: order.deliveryAddress,
      deliveredAt: order.deliveredAt,
      milestones,
      delivery: activeDelivery
        ? {
            id: activeDelivery.id,
            status: activeDelivery.status,
            currentLat: activeDelivery.currentLat,
            currentLng: activeDelivery.currentLng,
            estimatedArrival: activeDelivery.estimatedArrival,
            deliveryProof: activeDelivery.deliveryProof,
            confirmedOtp: activeDelivery.confirmedOtp ? 'CONFIRMED' : 'PENDING',
            vehicle: activeDelivery.vehicle
              ? {
                  vehicleNumber: activeDelivery.vehicle.vehicleNumber,
                  vehicleType: activeDelivery.vehicle.vehicleType,
                  driverName: activeDelivery.vehicle.driverName,
                  driverMobile: activeDelivery.vehicle.driverMobile,
                }
              : null,
          }
        : null,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Confirm Delivery (Buyer or Delivery Partner)
router.post('/:id/confirm-delivery', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { otp, proofPhotoUrl } = req.body;
    const userId = req.user!.id;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        buyer: true,
        deliveries: true,
      },
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    if (['DELIVERED', 'PAYMENT_RELEASED', 'COMPLETED'].includes(order.status)) {
      res.status(400).json({ error: 'Order is already marked as delivered' });
      return;
    }

    // Advance order to DELIVERED (which also handles automatic payment release to farmer)
    const updatedOrder = await OrderStateMachine.transitionOrder(id, 'DELIVERED', userId, {
      confirmedOtp: otp || 'DIRECT_CONFIRM',
      proofPhotoUrl,
    });

    // Update Delivery record
    if (order.deliveries.length > 0) {
      await prisma.delivery.update({
        where: { id: order.deliveries[0].id },
        data: {
          status: 'DELIVERED',
          completedAt: new Date(),
          confirmedOtp: otp || 'VERIFIED',
          proofPhotoUrl: proofPhotoUrl || null,
          deliveryProof: `Delivered and verified by user ${userId} at ${new Date().toISOString()}`,
        },
      });
    }

    res.json({
      success: true,
      message: 'Delivery confirmed! Escrow funds released to farmer.',
      order: updatedOrder,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Submit Multi-Criteria Review & Rating (Buyer Only)
router.post('/:id/review', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      score,
      qualityScore,
      freshnessScore,
      accuracyScore,
      communicationScore,
      comment,
    } = req.body;
    const userId = req.user!.id;

    if (!score || score < 1 || score > 5) {
      res.status(400).json({ error: 'Overall score must be between 1 and 5' });
      return;
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        buyer: true,
        items: { include: { farmer: true } },
      },
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    // Only buyer can review order
    if (order.buyer.userId !== userId) {
      res.status(403).json({ error: 'Only the ordering buyer can submit a review' });
      return;
    }

    // Order must be delivered
    if (!['DELIVERED', 'PAYMENT_RELEASED', 'COMPLETED'].includes(order.status)) {
      res.status(400).json({ error: 'Reviews can only be posted after the order is delivered' });
      return;
    }

    // Check for existing review
    const existing = await prisma.rating.findUnique({
      where: {
        orderId_fromUserId: {
          orderId: order.id,
          fromUserId: userId,
        },
      },
    });

    if (existing) {
      res.status(400).json({ error: 'You have already submitted a review for this order' });
      return;
    }

    // Target farmer
    const primaryFarmerId = order.items[0]?.farmer?.id;
    const targetUserId = order.items[0]?.farmer?.userId;

    if (!targetUserId || !primaryFarmerId) {
      res.status(400).json({ error: 'No farmer associated with this order' });
      return;
    }

    // Save rating and recalculate farmer's true rating average in transaction
    const reviewResult = await prisma.$transaction(async (tx) => {
      const rating = await tx.rating.create({
        data: {
          orderId: order.id,
          fromUserId: userId,
          toUserId: targetUserId,
          score: Math.round(score),
          qualityScore: qualityScore ? Math.round(qualityScore) : null,
          freshnessScore: freshnessScore ? Math.round(freshnessScore) : null,
          accuracyScore: accuracyScore ? Math.round(accuracyScore) : null,
          communicationScore: communicationScore ? Math.round(communicationScore) : null,
          comment: comment?.trim() || null,
        },
      });

      // Calculate new true average rating for this farmer
      const allRatings = await tx.rating.findMany({
        where: { toUserId: targetUserId },
        select: { score: true },
      });

      const totalScore = allRatings.reduce((sum, r) => sum + r.score, 0);
      const avgRating = Math.round((totalScore / allRatings.length) * 10) / 10;

      await tx.farmerProfile.update({
        where: { id: primaryFarmerId },
        data: {
          rating: avgRating,
        },
      });

      return { rating, avgRating, totalReviews: allRatings.length };
    });

    // Notify farmer of new review
    await NotificationService.notify({
      userId: targetUserId,
      title: `New Rating Received: ${score} Stars!`,
      message: comment ? `Buyer review: "${comment}"` : `Buyer rated your produce ${score}/5 stars!`,
      type: 'NEW_RATING',
      metadata: { orderId: order.id, score },
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      rating: reviewResult.rating,
      newFarmerRating: reviewResult.avgRating,
      totalReviews: reviewResult.totalReviews,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 8. General status transition
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

// 9. Raise Dispute on an Order
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
