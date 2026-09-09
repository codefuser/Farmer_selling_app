export type UserRole = 'FARMER' | 'BUYER' | 'COORDINATOR' | 'LOGISTICS' | 'ADMIN';

export type FreshnessStatus = 'FRESH' | 'AGING' | 'URGENT' | 'EXPIRED';

export type BatchStatus = 'ACTIVE' | 'RESERVED' | 'SOLD_OUT' | 'EXPIRED';

export type QualityGrade = 'A' | 'B' | 'C' | 'ANY';

export type OrderStatus =
  | 'ORDERED'
  | 'ACCEPTED'
  | 'PICKUP_SCHEDULED'
  | 'COLLECTED'
  | 'QUALITY_CHECKED'
  | 'PACKED'
  | 'DISPATCHED'
  | 'DELIVERED'
  | 'PAYMENT_RELEASED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
  status?: string;
  preferredLanguage: string;
  farmerProfile?: FarmerProfile;
  buyerProfile?: BuyerProfile;
  coordinatorProfile?: CoordinatorProfile;
}

export interface FarmerProfile {
  id: string;
  farmerId: string;
  village: string;
  district: string;
  state: string;
  landSize?: number;
  rating: number;
  completedOrders: number;
  verified: boolean;
}

export interface BuyerProfile {
  id: string;
  businessName: string;
  ownerName: string;
  businessType: 'HOTEL' | 'RESTAURANT' | 'SUPERMARKET' | 'WHOLESALER' | 'CATERING' | 'LOCAL_SHOP';
  gstNumber?: string;
  address: string;
  district: string;
  latitude: number;
  longitude: number;
  verified: boolean;
}

export interface CoordinatorProfile {
  id: string;
  village: string;
  district: string;
  activeFarmersCount: number;
  verified: boolean;
}

export interface Product {
  id: string;
  name: string;
  nameTamil: string;
  category: string;
  unit: string;
  defaultShelfHours: number;
  referenceMinPrice: number;
  referenceMaxPrice: number;
  imageUrl: string;
  freshnessRules?: FreshnessRule[];
}

export interface FreshnessRule {
  id: string;
  productId: string;
  freshDurationHours: number;
  agingDurationHours: number;
  urgentDurationHours: number;
  urgentDiscountPercent: number;
}

export interface ProduceBatch {
  id: string;
  batchCode: string;
  farmerId: string;
  productId: string;
  quantity: number;
  initialQuantity: number;
  pricePerKg: number;
  qualityGrade: string;
  harvestedAt: string;
  listedAt: string;
  sellBy: string;
  freshnessStatus: FreshnessStatus;
  status: BatchStatus;
  village: string;
  district: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  notes?: string;
  distanceKm?: number;
  product?: Product;
  farmer?: {
    id: string;
    farmerId: string;
    village: string;
    rating: number;
    completedOrders: number;
    user: { name: string; mobile: string };
  };
  freshness?: {
    status: FreshnessStatus;
    hoursRemaining: number;
    minutesRemaining: number;
    formattedRemaining: string;
    percentRemaining: number;
    isUrgent: boolean;
    isExpired: boolean;
    recommendedDiscountPercent: number;
  };
}

export interface BuyerDemand {
  id: string;
  demandCode: string;
  buyerId: string;
  productId: string;
  requiredQuantity: number;
  minBudget: number;
  maxBudget: number;
  requiredGrade: string;
  deliveryDeadline: string;
  location: string;
  district: string;
  maxDistanceKm: number;
  status: 'OPEN' | 'MATCHED' | 'FULFILLED' | 'CANCELLED';
  notes?: string;
  createdAt: string;
  product?: Product;
  buyer?: BuyerProfile;
  offers?: Offer[];
}

export interface MatchedBatch {
  batchId: string;
  batchCode: string;
  farmerId: string;
  farmerName: string;
  farmerVillage: string;
  farmerRating: number;
  farmerOrdersCompleted: number;
  productName: string;
  quantityAvailable: number;
  pricePerKg: number;
  qualityGrade: string;
  freshnessStatus: string;
  distanceKm: number;
  harvestedAt: string;
  sellBy: string;
  suitabilityScore: number;
  reasons: string[];
}

export interface CollectiveMatchGroup {
  groupId: string;
  totalQuantity: number;
  requiredQuantity: number;
  isFulfilled: boolean;
  averagePrice: number;
  farmerCount: number;
  combinedScore: number;
  batches: Array<{
    batch: MatchedBatch;
    allocatedQuantity: number;
    subtotal: number;
  }>;
  explanation: string;
}

export interface Offer {
  id: string;
  demandId: string;
  batchId: string;
  buyerId: string;
  farmerId: string;
  offeredPricePerKg: number;
  quantity: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COUNTERED';
  isCounterOffer: boolean;
  notes?: string;
  createdAt: string;
  batch?: ProduceBatch;
  buyer?: { businessName: string; ownerName: string };
  farmer?: { village: string; rating: number; user: { name: string } };
  history?: Array<{
    id: string;
    proposedByUserId: string;
    pricePerKg: number;
    notes?: string;
    createdAt: string;
  }>;
}

export interface Order {
  id: string;
  orderCode: string;
  buyerId: string;
  collectiveOrderId?: string;
  totalQuantity: number;
  totalAmount: number;
  platformFee: number;
  farmerPayout: number;
  status: OrderStatus;
  deliveryAddress: string;
  scheduledPickupTime?: string;
  deliveredAt?: string;
  createdAt: string;
  buyer?: BuyerProfile & { user?: { name: string; mobile: string } };
  items?: Array<{
    id: string;
    farmerId: string;
    batchId: string;
    quantity: number;
    pricePerKg: number;
    total: number;
    farmer?: FarmerProfile & { user?: { name: string; mobile: string } };
    batch?: ProduceBatch;
  }>;
  deliveries?: Array<{
    id: string;
    status: string;
    currentLat: number;
    currentLng: number;
    vehicle?: {
      vehicleNumber: string;
      driverName: string;
      driverMobile: string;
    };
  }>;
  payments?: Array<{
    id: string;
    paymentCode: string;
    amount: number;
    status: string;
    paymentMethod: string;
    transactionRef?: string;
  }>;
  qualityChecks?: Array<{
    id: string;
    expectedQty: number;
    actualQty: number;
    damagedQty: number;
    acceptedQty: number;
    gradeAssigned: string;
    damagePercentage: number;
    status: string;
    remarks?: string;
  }>;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  channel: string;
  isRead: boolean;
  createdAt: string;
  metadataJson?: string;
}
