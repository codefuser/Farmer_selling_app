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
  activeRole?: string;
  avatarUrl?: string;
  status?: string;
  preferredLanguage: string;
  farmerProfile?: FarmerProfile;
  buyerProfile?: BuyerProfile;
  coordinatorProfile?: CoordinatorProfile;
}

export interface FarmerProfile {
  id: string;
  userId?: string;
  farmerId: string;
  village: string;
  district: string;
  state: string;
  landSize?: number;
  farmingType?: string;
  mainCrops?: string;
  experienceYears?: number;
  bio?: string;
  rating: number;
  completedOrders: number;
  verified: boolean;
  identityVerificationStatus?: string;
  farmVerificationStatus?: string;
}

export interface BuyerProfile {
  id: string;
  userId?: string;
  businessName: string;
  ownerName: string;
  businessType: 'HOTEL' | 'RESTAURANT' | 'SUPERMARKET' | 'WHOLESALER' | 'CATERING' | 'LOCAL_SHOP' | string;
  consumerType?: string;
  gstNumber?: string;
  address: string;
  district: string;
  latitude: number;
  longitude: number;
  verified: boolean;
}

export interface PostMedia {
  id: string;
  url: string;
  type: string;
}

export interface PostCommentReply {
  id: string;
  commentId: string;
  userId: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatarUrl?: string;
    role: string;
  };
}

export interface PostComment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatarUrl?: string;
    role: string;
  };
  replies?: PostCommentReply[];
}

export interface Post {
  id: string;
  farmerId: string;
  farmer: {
    id: string;
    name: string;
    avatarUrl?: string;
    farmerId: string;
    village: string;
    district: string;
    rating: number;
    verified: boolean;
    userId: string;
  };
  caption: string;
  cropName?: string;
  price?: number;
  quantity?: number;
  unit?: string;
  qualityGrade?: string;
  harvestDate?: string;
  location: string;
  media: PostMedia[];
  batchId?: string;
  batch?: {
    id: string;
    batchCode: string;
    freshnessStatus: FreshnessStatus;
    product?: {
      name: string;
      nameTamil: string;
      imageUrl: string;
    };
  } | null;
  likeCount: number;
  commentCount: number;
  isLikedByMe: boolean;
  createdAt: string;
}

export interface MessageAttachment {
  id: string;
  fileUrl: string;
  fileType: string;
  fileName?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  content: string;
  attachments?: MessageAttachment[];
  createdAt: string;
}

export interface Conversation {
  id: string;
  recipient: {
    id: string;
    name: string;
    avatarUrl?: string;
    role: string;
  };
  lastMessage?: {
    content: string;
    createdAt: string;
    isMine: boolean;
  } | null;
  unreadCount: number;
  updatedAt: string;
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
  deliveryFee?: number;
  deliveryMethod?: string;
  cancellationReason?: string;
  cancelledBy?: string;
  cancelledAt?: string;
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

export interface VegetableMarketRate {
  id: string;
  name: string;
  nameTamil: string;
  category: string;
  unit: string;
  district: string;
  mandi: string;
  variety?: string;
  grade?: string;
  date: string;
  minPrice: number;
  modalPrice: number;
  maxPrice: number;
  trendPercentage: number;
  isRising: boolean;
  arrivalQuintals: number;
  kisanDirectPrice: number;
  farmerBenefitPerKg: number;
  buyerSavingsPerKg: number;
  imageUrl: string;
  isGovVerified?: boolean;
  source?: string;
}

export interface MandiMarketSummary {
  mandiName: string;
  district: string;
  date: string;
  totalArrivalQuintals: number;
  topGainers: { name: string; trend: number }[];
  topDecliners: { name: string; trend: number }[];
  rates: VegetableMarketRate[];
  isLiveGovData?: boolean;
  source?: string;
  lastSyncedAt?: string;
  totalRecords?: number;
  availableDistricts?: string[];
}

export interface MandiInfo {
  id: string;
  name: string;
  district: string;
}

