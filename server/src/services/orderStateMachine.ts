import { prisma } from '../config/db.js';

export const ORDER_STATUS_FLOW = [
  'ORDERED',
  'ACCEPTED',
  'PICKUP_SCHEDULED',
  'COLLECTED',
  'QUALITY_CHECKED',
  'PACKED',
  'DISPATCHED',
  'DELIVERED',
  'PAYMENT_RELEASED',
  'COMPLETED',
] as const;

export type OrderStatus = typeof ORDER_STATUS_FLOW[number] | 'CANCELLED';

export class OrderStateMachine {
  /**
   * Checks whether a status transition is valid
   */
  public static isValidTransition(currentStatus: string, nextStatus: string): boolean {
    if (currentStatus === nextStatus) return true;
    if (nextStatus === 'CANCELLED') {
      return ['ORDERED', 'ACCEPTED', 'PICKUP_SCHEDULED'].includes(currentStatus);
    }

    const currentIndex = ORDER_STATUS_FLOW.indexOf(currentStatus as any);
    const nextIndex = ORDER_STATUS_FLOW.indexOf(nextStatus as any);

    if (currentIndex === -1 || nextIndex === -1) return false;

    // Allow forward step or sequential advance
    return nextIndex === currentIndex + 1 || nextIndex > currentIndex;
  }

  /**
   * Advances an order to a new status with automated side-effects
   */
  public static async transitionOrder(orderId: string, nextStatus: OrderStatus, actorUserId?: string, details?: any) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        buyer: { include: { user: true } },
        items: { include: { farmer: { include: { user: true } }, batch: true } },
        payments: true,
        deliveries: true,
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    if (!this.isValidTransition(order.status, nextStatus)) {
      throw new Error(`Invalid status transition from ${order.status} to ${nextStatus}`);
    }

    return await prisma.$transaction(async (tx) => {
      const updateData: any = {
        status: nextStatus,
      };

      if (nextStatus === 'DELIVERED') {
        updateData.deliveredAt = new Date();
      }

      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: updateData,
      });

      // Side-effect 1: When order is DELIVERED, automatically trigger PAYMENT_RELEASED or prepare payouts
      if (nextStatus === 'PAYMENT_RELEASED' || nextStatus === 'DELIVERED') {
        // Update payment status
        for (const payment of order.payments) {
          await tx.payment.update({
            where: { id: payment.id },
            data: {
              status: 'RELEASED',
              releasedAt: new Date(),
            },
          });

          // Create farmer payout records if not already created
          for (const item of order.items) {
            const netAmount = Math.round(item.total * 0.98);
            await tx.farmerPayout.create({
              data: {
                paymentId: payment.id,
                farmerId: item.farmerId,
                amount: netAmount,
                status: 'RELEASED',
                utrRef: `UTR-${Date.now().toString().slice(-8)}`,
                releasedAt: new Date(),
              },
            });

            // Increment farmer completed orders count
            await tx.farmerProfile.update({
              where: { id: item.farmerId },
              data: {
                completedOrders: { increment: 1 },
              },
            });
          }
        }
      }

      // Side-effect 2: If CANCELLED, restore batch quantities
      if (nextStatus === 'CANCELLED') {
        for (const item of order.items) {
          await tx.produceBatch.update({
            where: { id: item.batchId },
            data: {
              quantity: { increment: item.quantity },
              status: 'ACTIVE',
            },
          });
        }
      }

      // Notify Buyer & Farmers
      const statusTitle = `Order ${order.orderCode} Status Updated: ${nextStatus.replace('_', ' ')}`;
      const message = `Your order ${order.orderCode} is now in state: ${nextStatus.replace('_', ' ')}.`;

      // Notify Buyer
      await tx.notification.create({
        data: {
          userId: order.buyer.userId,
          title: statusTitle,
          message,
          type: nextStatus,
          metadataJson: JSON.stringify({ orderId }),
        },
      });

      // Notify all participating farmers
      for (const item of order.items) {
        await tx.notification.create({
          data: {
            userId: item.farmer.userId,
            title: statusTitle,
            message,
            type: nextStatus,
            metadataJson: JSON.stringify({ orderId, quantity: item.quantity }),
          },
        });
      }

      return updatedOrder;
    });
  }
}

export default OrderStateMachine;
