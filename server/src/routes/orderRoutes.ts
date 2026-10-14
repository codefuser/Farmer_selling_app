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

// ==========================================
// ULAVAR2ULAGAM CUSTOMER CHECKOUT & ORDERS
// ==========================================

// Safe Central Inventory Checkout
router.post('/checkout', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    let buyer = await prisma.buyerProfile.findUnique({ where: { userId } });
    if (!buyer) {
      buyer = await prisma.buyerProfile.create({
        data: {
          userId,
          businessName: req.user!.name || 'Customer Residence',
          ownerName: req.user!.name || 'Customer',
          businessType: 'INDIVIDUAL',
          consumerType: 'INDIVIDUAL',
          address: req.body.deliveryAddress || 'Salem, Tamil Nadu',
          district: 'Salem',
        },
      });
    }

    const {
      items,
      deliveryAddress,
      customerName = req.user!.name,
      customerPhone,
      paymentMethod = 'DEMO_UPI',
      notes,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'At least one item is required in the cart to place an order.' });
      return;
    }

    if (!deliveryAddress) {
      res.status(400).json({ error: 'Delivery address is required.' });
      return;
    }

    const orderResult = await prisma.$transaction(async (tx) => {
      let subtotal = 0;
      let totalQty = 0;
      const orderItemsData: any[] = [];

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error(`Product with ID ${item.productId} was not found.`);
        }

        const qty = parseFloat(String(item.quantity));
        if (isNaN(qty) || qty <= 0) {
          throw new Error(`Invalid quantity for ${product.name}.`);
        }

        if (product.stockQuantity < qty) {
          throw new Error(
            `Insufficient stock for "${product.name}". Requested: ${qty} ${product.unit}, Available: ${product.stockQuantity} ${product.unit}.`
          );
        }

        const itemTotal = Math.round(qty * product.sellingPrice * 100) / 100;
        subtotal += itemTotal;
        totalQty += qty;

        // Decrement product stock safely
        const remainingStock = product.stockQuantity - qty;
        await tx.product.update({
          where: { id: product.id },
          data: {
            stockQuantity: remainingStock,
            status: remainingStock === 0 ? 'OUT_OF_STOCK' : remainingStock <= product.lowStockThreshold ? 'LOW_STOCK' : 'IN_STOCK',
          },
        });

        orderItemsData.push({
          productId: product.id,
          productName: product.name,
          quantity: qty,
          unit: product.unit || 'kg',
          pricePerKg: product.sellingPrice,
          total: itemTotal,
          farmerId: null,
          batchId: null,
        });
      }

      // Delivery fee rule: Free above ₹500, else ₹30
      const deliveryFee = subtotal >= 500 ? 0 : 30;
      const totalAmount = subtotal + deliveryFee;
      const orderCode = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      // Create Order
      const newOrder = await tx.order.create({
        data: {
          orderCode,
          buyerId: buyer.id,
          totalQuantity: totalQty,
          subtotal,
          deliveryFee,
          totalAmount,
          platformFee: 0,
          farmerPayout: subtotal * 0.8,
          status: 'PENDING',
          paymentMethod,
          paymentStatus: 'PAID',
          customerName: customerName || req.user!.name,
          customerPhone: customerPhone || (req.user as any)?.mobile || '9876543210',
          deliveryAddress,
        },
      });

      // Create OrderItems
      for (const itemData of orderItemsData) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: itemData.productId,
            productName: itemData.productName,
            quantity: itemData.quantity,
            unit: itemData.unit,
            pricePerKg: itemData.pricePerKg,
            total: itemData.total,
            farmerId: itemData.farmerId,
            batchId: itemData.batchId,
          },
        });

        // Record Inventory Outflow Transaction
        const updatedProd = await tx.product.findUnique({ where: { id: itemData.productId } });
        await tx.inventoryTransaction.create({
          data: {
            productId: itemData.productId,
            type: 'ORDER_OUTFLOW',
            quantity: -itemData.quantity,
            balanceAfter: updatedProd?.stockQuantity || 0,
            referenceCode: orderCode,
            notes: `Purchased by ${customerName} in order ${orderCode}`,
          },
        });
      }

      // Create initial payment record
      await tx.payment.create({
        data: {
          paymentCode: `PAY-${Date.now().toString().slice(-6)}`,
          orderId: newOrder.id,
          buyerId: buyer.id,
          amount: totalAmount,
          status: 'AUTHORIZED',
          paymentMethod,
          transactionRef: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
        },
      });

      return newOrder;
    });

    // Realtime notification to all storefront viewers
    RealtimeService.broadcast('inventory_update', {
      orderId: orderResult.id,
      items: items.map((i: any) => i.productId),
      action: 'purchased',
    });

    res.status(201).json({
      message: 'Order placed successfully! Inventory reserved and our team is processing it.',
      order: orderResult,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Customer My Orders
router.get('/my-orders', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const buyer = await prisma.buyerProfile.findUnique({ where: { userId } });

    if (!buyer) {
      res.json([]);
      return;
    }

    const orders = await prisma.order.findMany({
      where: { buyerId: buyer.id },
      include: {
        items: { include: { product: true } },
        deliveryAssignment: { include: { driver: { select: { name: true, mobile: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Customer Cancel Order
router.post('/:id/cancel-customer', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user!.id;

    const buyer = await prisma.buyerProfile.findUnique({ where: { userId } });
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }

    if (buyer && order.buyerId !== buyer.id && req.user!.role !== 'ADMIN') {
      res.status(403).json({ error: 'Unauthorized: You did not place this order.' });
      return;
    }

    if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
      res.status(400).json({
        error: `Cannot cancel an order that is already in "${order.status}" stage. Please contact support.`,
      });
      return;
    }

    // Restore stock and cancel
    const result = await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        if (item.productId) {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (product) {
            const restored = product.stockQuantity + item.quantity;
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stockQuantity: restored,
                status: 'IN_STOCK',
              },
            });

            await tx.inventoryTransaction.create({
              data: {
                productId: item.productId,
                type: 'ORDER_RESTORE',
                quantity: item.quantity,
                balanceAfter: restored,
                referenceCode: order.orderCode,
                notes: `Customer cancelled order ${order.orderCode}. Stock restored.`,
              },
            });
          }
        }
      }

      return await tx.order.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancellationReason: reason || 'Cancelled by customer before processing',
        },
      });
    });

    res.json({ message: 'Order cancelled successfully and stock restored to inventory.', order: result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
