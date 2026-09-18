import { prisma } from '../config/db.js';

export type DeliveryMethod = 'STANDARD' | 'EXPRESS' | 'FARMER_DIRECT' | 'SELF_PICKUP';

export interface DeliveryCalculationInput {
  deliveryMethod?: DeliveryMethod;
  totalWeightKg: number;
  originLat?: number;
  originLng?: number;
  destLat?: number;
  destLng?: number;
  originVillage?: string;
  originDistrict?: string;
  destVillage?: string;
  destDistrict?: string;
}

export interface DeliveryCalculationResult {
  deliveryMethod: DeliveryMethod;
  distanceKm: number;
  totalWeightKg: number;
  baseFee: number;
  distanceFee: number;
  weightFee: number;
  totalDeliveryFee: number;
  estimatedDays: number;
  ruleApplied: string;
}

export class DeliveryPricingService {
  /**
   * Calculate distance between two coordinate pairs using Haversine formula (km)
   */
  public static calculateHaversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }

  /**
   * Estimate distance based on geographic names if coordinates are missing/zero
   */
  public static estimateFallbackDistance(
    originVillage?: string,
    originDistrict?: string,
    destVillage?: string,
    destDistrict?: string
  ): number {
    if (originVillage && destVillage && originVillage.toLowerCase() === destVillage.toLowerCase()) {
      return 3.0; // Same village
    }
    if (originDistrict && destDistrict && originDistrict.toLowerCase() === destDistrict.toLowerCase()) {
      return 18.0; // Same district
    }
    return 45.0; // Adjacent / regional district
  }

  /**
   * Calculate complete delivery price breakdown
   */
  public static async calculateFee(input: DeliveryCalculationInput): Promise<DeliveryCalculationResult> {
    const method: DeliveryMethod = input.deliveryMethod || 'STANDARD';
    const weight = Math.max(1, Math.round(input.totalWeightKg * 10) / 10);

    // If buyer picks up at the farm/center, fee is strictly ₹0
    if (method === 'SELF_PICKUP') {
      return {
        deliveryMethod: 'SELF_PICKUP',
        distanceKm: 0,
        totalWeightKg: weight,
        baseFee: 0,
        distanceFee: 0,
        weightFee: 0,
        totalDeliveryFee: 0,
        estimatedDays: 0,
        ruleApplied: 'Self Pickup (Free)',
      };
    }

    // Determine distance
    let distance = 0;
    if (
      input.originLat &&
      input.originLng &&
      input.destLat &&
      input.destLng &&
      (input.originLat !== input.destLat || input.originLng !== input.destLng)
    ) {
      distance = this.calculateHaversineDistance(
        input.originLat,
        input.originLng,
        input.destLat,
        input.destLng
      );
    } else {
      distance = this.estimateFallbackDistance(
        input.originVillage,
        input.originDistrict,
        input.destVillage,
        input.destDistrict
      );
    }
    distance = Math.max(1.0, distance);

    // Farmer Direct: Flat local delivery managed directly by farmer
    if (method === 'FARMER_DIRECT') {
      const flatFee = 25.0;
      const kmRate = distance > 10 ? (distance - 10) * 3.0 : 0;
      const total = Math.round(flatFee + kmRate);
      return {
        deliveryMethod: 'FARMER_DIRECT',
        distanceKm: distance,
        totalWeightKg: weight,
        baseFee: flatFee,
        distanceFee: Math.round(kmRate),
        weightFee: 0,
        totalDeliveryFee: total,
        estimatedDays: 1,
        ruleApplied: 'Farmer Direct Local',
      };
    }

    // Standard or Express Delivery: query pricing rules or use calibrated tiers
    let baseFee = method === 'EXPRESS' ? 60.0 : 30.0;
    let perKmRate = method === 'EXPRESS' ? 7.0 : 4.0;
    let perKgRate = method === 'EXPRESS' ? 1.5 : 0.75;
    let ruleName = method === 'EXPRESS' ? 'Default Express Tier' : 'Default Standard Tier';

    try {
      const activeRule = await prisma.deliveryPricingRule.findFirst({
        where: {
          isActive: true,
          minDistanceKm: { lte: distance },
          OR: [{ maxDistanceKm: null }, { maxDistanceKm: { gte: distance } }],
          minWeightKg: { lte: weight },
          AND: [{ OR: [{ maxWeightKg: null }, { maxWeightKg: { gte: weight } }] }],
        },
        orderBy: { baseFee: 'asc' },
      });

      if (activeRule) {
        baseFee = activeRule.baseFee;
        perKmRate = activeRule.perKmRate;
        perKgRate = activeRule.perKgRate;
        ruleName = activeRule.name;
        if (method === 'EXPRESS') {
          baseFee = Math.round(baseFee * 1.5);
          perKmRate = Math.round(perKmRate * 1.4);
          ruleName += ' (Express Multiplier)';
        }
      }
    } catch {
      // Use calibrated fallback values if database table not yet populated
    }

    const distanceFee = Math.round(distance * perKmRate * 100) / 100;
    const weightFee = Math.round(weight * perKgRate * 100) / 100;
    const totalDeliveryFee = Math.round(baseFee + distanceFee + weightFee);
    const estimatedDays = method === 'EXPRESS' ? 1 : distance > 30 ? 2 : 1;

    return {
      deliveryMethod: method,
      distanceKm: distance,
      totalWeightKg: weight,
      baseFee,
      distanceFee,
      weightFee,
      totalDeliveryFee,
      estimatedDays,
      ruleApplied: ruleName,
    };
  }
}

export default DeliveryPricingService;
