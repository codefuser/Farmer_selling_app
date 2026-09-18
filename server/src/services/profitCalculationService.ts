import { prisma } from '../config/db.js';

export interface OrderItemCalculation {
  batchId: string;
  quantity: number;
  pricePerKg: number;
  farmerId: string;
}

export interface FinancialBreakdown {
  subtotal: number;
  platformFee: number; // 2% service charge
  farmerPayout: number; // subtotal - platformFee
  deliveryFee: number;
  totalAmount: number; // subtotal + deliveryFee
}

export class ProfitCalculationService {
  public static readonly PLATFORM_FEE_PERCENT = 0.02; // 2%

  /**
   * Calculate precise financial breakdown for an order
   */
  public static calculateOrderBreakdown(
    subtotal: number,
    deliveryFee: number = 0
  ): FinancialBreakdown {
    const cleanSubtotal = Math.max(0, Math.round(subtotal * 100) / 100);
    const platformFee = Math.round(cleanSubtotal * this.PLATFORM_FEE_PERCENT * 100) / 100;
    const farmerPayout = Math.max(0, Math.round((cleanSubtotal - platformFee) * 100) / 100);
    const cleanDelivery = Math.max(0, Math.round(deliveryFee * 100) / 100);
    const totalAmount = Math.round((cleanSubtotal + cleanDelivery) * 100) / 100;

    return {
      subtotal: cleanSubtotal,
      platformFee,
      farmerPayout,
      deliveryFee: cleanDelivery,
      totalAmount,
    };
  }

  /**
   * Get real farmer earnings and net profit breakdown including input costs
   */
  public static async getFarmerFinancials(farmerId: string) {
    // 1. Get all payouts for this farmer
    const payouts = await prisma.farmerPayout.findMany({
      where: { farmerId },
      include: {
        payment: {
          include: {
            order: true,
          },
        },
      },
    });

    let totalReleased = 0;
    let pendingPayouts = 0;
    let todayEarnings = 0;
    const todayStr = new Date().toISOString().split('T')[0];

    const monthlyMap: Record<string, { revenue: number; costs: number }> = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Initialize last 6 months in monthlyMap
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      monthlyMap[key] = { revenue: 0, costs: 0 };
    }

    for (const p of payouts) {
      if (p.status === 'RELEASED') {
        totalReleased += p.amount;
        const pDate = p.releasedAt || p.createdAt;
        const pDateStr = pDate.toISOString().split('T')[0];
        if (pDateStr === todayStr) {
          todayEarnings += p.amount;
        }

        const mKey = `${monthNames[pDate.getMonth()]} ${pDate.getFullYear()}`;
        if (monthlyMap[mKey]) {
          monthlyMap[mKey].revenue += p.amount;
        }
      } else {
        pendingPayouts += p.amount;
      }
    }

    // 2. Get all input costs for this farmer
    const costs = await prisma.farmerCost.findMany({
      where: { farmerId },
      orderBy: { date: 'desc' },
    });

    let totalCosts = 0;
    const costByCategory: Record<string, number> = {
      SEED: 0,
      FERTILIZER: 0,
      PESTICIDE: 0,
      LABOR: 0,
      TRANSPORT: 0,
      IRRIGATION: 0,
      MACHINERY: 0,
      OTHER: 0,
    };

    for (const c of costs) {
      totalCosts += c.amount;
      if (costByCategory[c.category] !== undefined) {
        costByCategory[c.category] += c.amount;
      } else {
        costByCategory.OTHER = (costByCategory.OTHER || 0) + c.amount;
      }

      const cDate = c.date;
      const mKey = `${monthNames[cDate.getMonth()]} ${cDate.getFullYear()}`;
      if (monthlyMap[mKey]) {
        monthlyMap[mKey].costs += c.amount;
      }
    }

    const netProfit = Math.round((totalReleased - totalCosts) * 100) / 100;
    const profitMargin =
      totalReleased > 0 ? Math.round((netProfit / totalReleased) * 1000) / 10 : 0;

    // Convert monthly map to array for frontend charting
    const monthlyData = Object.entries(monthlyMap).map(([month, val]) => ({
      month,
      revenue: Math.round(val.revenue),
      costs: Math.round(val.costs),
      profit: Math.round(val.revenue - val.costs),
    }));

    return {
      totalRevenue: Math.round(totalReleased),
      pendingPayouts: Math.round(pendingPayouts),
      todayEarnings: Math.round(todayEarnings),
      totalCosts: Math.round(totalCosts),
      netProfit,
      profitMargin,
      costByCategory,
      monthlyData,
      recentCosts: costs.slice(0, 10),
    };
  }
}

export default ProfitCalculationService;
