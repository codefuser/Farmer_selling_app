import { prisma } from '../config/db.js';

export class PaymentService {
  /**
   * Process mock payment authorization for an order
   */
  public static async authorizePayment(orderId: string, buyerId: string, method: string = 'MOCK_UPI') {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    const platformFee = Math.round(order.totalAmount * 0.02); // 2%
    const paymentCode = `PAY-${Date.now().toString().slice(-6)}`;
    const transactionRef = `UPI-TXN-${Date.now().toString().slice(-8)}`;

    const payment = await prisma.payment.create({
      data: {
        paymentCode,
        orderId,
        buyerId,
        amount: order.totalAmount,
        platformFee,
        status: 'AUTHORIZED',
        paymentMethod: method,
        transactionRef,
      },
    });

    return payment;
  }

  /**
   * Release escrow payments to farmers
   */
  public static async releasePayment(paymentId: string) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: {
          include: {
            items: { include: { farmer: true } },
          },
        },
      },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    return await prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: 'RELEASED',
          releasedAt: new Date(),
        },
      });

      // Release payouts for each farmer
      for (const item of payment.order.items) {
        const netPayout = Math.round(item.total * 0.98);
        await tx.farmerPayout.create({
          data: {
            paymentId,
            farmerId: item.farmerId,
            amount: netPayout,
            status: 'RELEASED',
            utrRef: `UTR-${Date.now().toString().slice(-8)}`,
            releasedAt: new Date(),
          },
        });
      }

      return updatedPayment;
    });
  }
}

export default PaymentService;
