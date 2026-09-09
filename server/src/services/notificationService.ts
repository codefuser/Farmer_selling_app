import { prisma } from '../config/db.js';

export class NotificationService {
  /**
   * Dispatches a notification across In-App, and mock SMS/WhatsApp/Voice channels
   */
  public static async notify(input: {
    userId: string;
    title: string;
    message: string;
    type: string;
    channel?: 'IN_APP' | 'SMS_MOCK' | 'WHATSAPP_MOCK' | 'VOICE_MOCK';
    metadata?: any;
  }) {
    return await prisma.notification.create({
      data: {
        userId: input.userId,
        title: input.title,
        message: input.message,
        type: input.type,
        channel: input.channel || 'IN_APP',
        metadataJson: input.metadata ? JSON.stringify(input.metadata) : null,
      },
    });
  }

  /**
   * Broadcast urgent sale alert to nearby B2B buyers
   */
  public static async broadcastUrgentSale(batch: any) {
    const b2bBuyers = await prisma.buyerProfile.findMany({
      where: {
        businessType: { in: ['HOTEL', 'RESTAURANT', 'SUPERMARKET', 'LOCAL_SHOP'] },
      },
      include: { user: true },
    });

    const notifications = [];
    for (const buyer of b2bBuyers) {
      notifications.push(
        prisma.notification.create({
          data: {
            userId: buyer.userId,
            title: `Urgent Perishable Sale: Fresh ${batch.product?.name || 'Produce'} Available!`,
            message: `Farmer in ${batch.village} has ${batch.quantity} kg of ${batch.product?.name} at special urgent price ₹${batch.pricePerKg}/kg. Moving fast!`,
            type: 'URGENT_SALE',
            channel: 'WHATSAPP_MOCK',
            metadataJson: JSON.stringify({ batchId: batch.id, price: batch.pricePerKg }),
          },
        })
      );
    }

    await Promise.all(notifications);
  }
}

export default NotificationService;
