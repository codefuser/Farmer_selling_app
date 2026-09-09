import { prisma } from '../config/db.js';

export interface CreateCollectiveOrderInput {
  demandId: string;
  buyerId: string;
  agreedPricePerKg: number;
  deliveryAddress: string;
  allocations: Array<{
    batchId: string;
    farmerId: string;
    allocatedQuantity: number;
  }>;
}

export class CollectiveSellingService {
  /**
   * Finalizes a collective order from matched farmer allocations
   */
  public static async createCollectiveOrder(input: CreateCollectiveOrderInput) {
    const { demandId, buyerId, agreedPricePerKg, deliveryAddress, allocations } = input;

    // Calculate total quantity and amount
    const totalQuantity = allocations.reduce((sum, a) => sum + a.allocatedQuantity, 0);
    const totalAmount = Math.round(totalQuantity * agreedPricePerKg);
    const platformFee = Math.round(totalAmount * 0.02); // 2% platform fee
    const farmerPayoutTotal = totalAmount - platformFee;

    const collectiveCode = `COL-${Date.now().toString().slice(-6)}`;
    const orderCode = `ORD-${Date.now().toString().slice(-6)}`;

    // Run transactionally to prevent race conditions or overselling
    return await prisma.$transaction(async (tx) => {
      // 1. Create CollectiveOrder
      const collectiveOrder = await tx.collectiveOrder.create({
        data: {
          collectiveCode,
          demandId,
          totalQuantity,
          agreedPricePerKg,
          totalAmount,
          status: 'CONFIRMED',
        },
      });

      // 2. Create Order
      const order = await tx.order.create({
        data: {
          orderCode,
          buyerId,
          collectiveOrderId: collectiveOrder.id,
          totalQuantity,
          totalAmount,
          platformFee,
          farmerPayout: farmerPayoutTotal,
          status: 'ORDERED',
          deliveryAddress,
        },
      });

      // 3. Process each farmer allocation
      for (const item of allocations) {
        const batch = await tx.produceBatch.findUnique({
          where: { id: item.batchId },
        });

        if (!batch) {
          throw new Error(`Batch ${item.batchId} not found`);
        }

        if (batch.quantity < item.allocatedQuantity) {
          throw new Error(`Insufficient quantity on batch ${batch.batchCode}. Available: ${batch.quantity}, Requested: ${item.allocatedQuantity}`);
        }

        const payout = Math.round(item.allocatedQuantity * agreedPricePerKg * 0.98); // net payout after 2% fee

        // Create CollectiveOrderMember
        await tx.collectiveOrderMember.create({
          data: {
            collectiveOrderId: collectiveOrder.id,
            farmerId: item.farmerId,
            batchId: item.batchId,
            allocatedQuantity: item.allocatedQuantity,
            payoutAmount: payout,
            status: 'ACCEPTED',
          },
        });

        // Create OrderItem
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            farmerId: item.farmerId,
            batchId: item.batchId,
            quantity: item.allocatedQuantity,
            pricePerKg: agreedPricePerKg,
            total: item.allocatedQuantity * agreedPricePerKg,
          },
        });

        // Deduct available quantity from batch
        const remainingQty = batch.quantity - item.allocatedQuantity;
        await tx.produceBatch.update({
          where: { id: item.batchId },
          data: {
            quantity: remainingQty,
            status: remainingQty <= 0 ? 'SOLD_OUT' : 'RESERVED',
          },
        });

        // Fetch farmer user for notification
        const farmer = await tx.farmerProfile.findUnique({
          where: { id: item.farmerId },
          select: { userId: true },
        });

        if (farmer) {
          await tx.notification.create({
            data: {
              userId: farmer.userId,
              title: 'New Collective Order Contribution!',
              message: `You have been included in collective order ${orderCode}. Your contribution: ${item.allocatedQuantity} kg at ₹${agreedPricePerKg}/kg.`,
              type: 'ORDER_CONFIRMED',
              channel: 'IN_APP',
              metadataJson: JSON.stringify({ orderId: order.id, collectiveOrderId: collectiveOrder.id }),
            },
          });
        }
      }

      // 4. Update Demand status
      await tx.buyerDemand.update({
        where: { id: demandId },
        data: { status: 'MATCHED' },
      });

      // 5. Create Mock Escrow Payment
      const payment = await tx.payment.create({
        data: {
          paymentCode: `PAY-${Date.now().toString().slice(-6)}`,
          orderId: order.id,
          buyerId,
          amount: totalAmount,
          platformFee,
          status: 'AUTHORIZED',
          paymentMethod: 'MOCK_UPI',
          transactionRef: `UPI-TXN-${Date.now().toString().slice(-8)}`,
        },
      });

      return { order, collectiveOrder, payment };
    });
  }
}

export default CollectiveSellingService;
