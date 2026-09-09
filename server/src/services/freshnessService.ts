import { prisma } from '../config/db.js';

export interface FreshnessResult {
  status: 'FRESH' | 'AGING' | 'URGENT' | 'EXPIRED';
  hoursRemaining: number;
  minutesRemaining: number;
  formattedRemaining: string;
  percentRemaining: number;
  isUrgent: boolean;
  isExpired: boolean;
  recommendedDiscountPercent: number;
}

export class FreshnessService {
  /**
   * Calculates freshness details for a produce batch
   */
  public static calculateFreshness(
    harvestedAt: Date,
    sellBy: Date,
    productRules?: {
      freshDurationHours?: number;
      agingDurationHours?: number;
      urgentDurationHours?: number;
      urgentDiscountPercent?: number;
    }
  ): FreshnessResult {
    const now = new Date();
    const harvestTime = new Date(harvestedAt).getTime();
    const sellByTime = new Date(sellBy).getTime();
    const currentTime = now.getTime();

    const totalLifetimeMs = Math.max(1, sellByTime - harvestTime);
    const timeRemainingMs = sellByTime - currentTime;

    if (timeRemainingMs <= 0) {
      return {
        status: 'EXPIRED',
        hoursRemaining: 0,
        minutesRemaining: 0,
        formattedRemaining: 'Expired',
        percentRemaining: 0,
        isUrgent: false,
        isExpired: true,
        recommendedDiscountPercent: 0,
      };
    }

    const totalMinutesRemaining = Math.floor(timeRemainingMs / (1000 * 60));
    const hoursRemaining = Math.floor(totalMinutesRemaining / 60);
    const minutesRemaining = totalMinutesRemaining % 60;
    const percentRemaining = Math.max(0, Math.min(100, Math.round((timeRemainingMs / totalLifetimeMs) * 100)));

    const urgentHours = productRules?.urgentDurationHours ?? 4;
    const agingHours = productRules?.agingDurationHours ?? 10;
    const urgentMs = urgentHours * 60 * 60 * 1000;
    const agingMs = agingHours * 60 * 60 * 1000;

    let status: 'FRESH' | 'AGING' | 'URGENT' | 'EXPIRED' = 'FRESH';
    let isUrgent = false;
    let recommendedDiscount = 0;

    if (timeRemainingMs <= urgentMs) {
      status = 'URGENT';
      isUrgent = true;
      recommendedDiscount = productRules?.urgentDiscountPercent ?? 15;
    } else if (timeRemainingMs <= agingMs || percentRemaining <= 40) {
      status = 'AGING';
      recommendedDiscount = 5;
    } else {
      status = 'FRESH';
    }

    const formattedRemaining = hoursRemaining > 0 
      ? `${hoursRemaining}h ${minutesRemaining}m remaining` 
      : `${minutesRemaining}m remaining`;

    return {
      status,
      hoursRemaining,
      minutesRemaining,
      formattedRemaining,
      percentRemaining,
      isUrgent,
      isExpired: false,
      recommendedDiscountPercent: recommendedDiscount,
    };
  }

  /**
   * Syncs and updates all active batches in the database
   */
  public static async evaluateAllActiveBatches(): Promise<{ updated: number; expired: number; urgent: number }> {
    const activeBatches = await prisma.produceBatch.findMany({
      where: {
        status: { in: ['ACTIVE', 'RESERVED'] },
      },
      include: {
        product: {
          include: { freshnessRules: true },
        },
      },
    });

    let updated = 0;
    let expired = 0;
    let urgent = 0;

    for (const batch of activeBatches) {
      const rule = batch.product.freshnessRules[0];
      const freshness = this.calculateFreshness(batch.harvestedAt, batch.sellBy, rule);

      let newStatus = batch.status;
      if (freshness.status === 'EXPIRED') {
        newStatus = 'EXPIRED';
        expired++;
      } else if (freshness.status === 'URGENT') {
        urgent++;
      }

      if (batch.freshnessStatus !== freshness.status || batch.status !== newStatus) {
        await prisma.produceBatch.update({
          where: { id: batch.id },
          data: {
            freshnessStatus: freshness.status,
            status: newStatus,
          },
        });
        updated++;
      }
    }

    return { updated, expired, urgent };
  }
}

export default FreshnessService;
