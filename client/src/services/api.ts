import {
  User,
  Product,
  ProduceBatch,
  BuyerDemand,
  Offer,
  Order,
  NotificationItem,
  MatchedBatch,
  CollectiveMatchGroup,
  VegetableMarketRate,
  MandiMarketSummary,
  MandiInfo,
  Post,
  PostComment,
  Conversation,
  Message,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

export const getMediaUrl = (url?: string | null): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const backendBase = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/$/, '')
    : 'https://farmer-selling-app.onrender.com';
  if (url.startsWith('/uploads')) {
    return `${backendBase}${url}`;
  }
  return url;
};

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('kisandirect_token');
  }

  public setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('kisandirect_token', token);
    } else {
      localStorage.removeItem('kisandirect_token');
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data as T;
  }

  // Auth APIs
  public async login(emailOrMobile: string, password: string):Promise<{ token: string; user: User }> {
    const data = await this.request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ emailOrMobile, password }),
    });
    this.setToken(data.token);
    return data;
  }

  public async register(userData: any): Promise<{ token: string; user: User }> {
    const data = await this.request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    this.setToken(data.token);
    return data;
  }

  public async verifyOtp(mobile: string, otp: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ mobile, otp }),
    });
  }

  public async demoSwitch(role: string): Promise<{ token: string; user: User }> {
    const data = await this.request<{ token: string; user: User }>('/auth/demo-switch', {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
    this.setToken(data.token);
    return data;
  }

  public async getMe(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/auth/me');
  }

  // Farmer APIs
  public async getFarmerProducts(): Promise<Product[]> {
    return this.request<Product[]>('/farmers/products');
  }

  public async getFarmerDashboard(): Promise<any> {
    return this.request<any>('/farmers/dashboard');
  }

  public async getFarmerBatches(): Promise<ProduceBatch[]> {
    return this.request<ProduceBatch[]>('/farmers/batches');
  }

  public async createFarmerBatch(batchData: any): Promise<{ message: string; batch: ProduceBatch }> {
    return this.request<{ message: string; batch: ProduceBatch }>('/farmers/batches', {
      method: 'POST',
      body: JSON.stringify(batchData),
    });
  }

  public async getFarmerOffers(): Promise<Offer[]> {
    return this.request<Offer[]>('/farmers/offers');
  }

  public async acceptFarmerOffer(offerId: string): Promise<any> {
    return this.request<any>(`/farmers/offers/${offerId}/accept`, { method: 'PATCH' });
  }

  public async rejectFarmerOffer(offerId: string): Promise<any> {
    return this.request<any>(`/farmers/offers/${offerId}/reject`, { method: 'PATCH' });
  }

  public async counterFarmerOffer(offerId: string, counterPricePerKg: number, notes?: string): Promise<any> {
    return this.request<any>(`/farmers/offers/${offerId}/counter`, {
      method: 'POST',
      body: JSON.stringify({ counterPricePerKg, notes }),
    });
  }

  public async getFarmerOrders(): Promise<any[]> {
    return this.request<any[]>('/farmers/orders');
  }

  public async getFarmerEarnings(): Promise<any> {
    return this.request<any>('/farmers/earnings');
  }

  public async getFarmerCollectivePools(): Promise<any[]> {
    return this.request<any[]>('/farmers/collective-pools');
  }

  // Buyer APIs
  public async getBuyerDashboard(): Promise<any> {
    return this.request<any>('/buyers/dashboard');
  }

  public async getMarketplaceProduce(filters: Record<string, string> = {}): Promise<ProduceBatch[]> {
    const params = new URLSearchParams(filters);
    return this.request<ProduceBatch[]>(`/buyers/marketplace?${params.toString()}`);
  }

  public async postBuyerDemand(demandData: any): Promise<{ message: string; demand: BuyerDemand }> {
    return this.request<{ message: string; demand: BuyerDemand }>('/buyers/demands', {
      method: 'POST',
      body: JSON.stringify(demandData),
    });
  }

  public async getBuyerDemands(): Promise<BuyerDemand[]> {
    return this.request<BuyerDemand[]>('/buyers/demands');
  }

  public async getDemandMatches(demandId: string): Promise<{
    demand: BuyerDemand;
    individualMatches: MatchedBatch[];
    collectiveSupply: CollectiveMatchGroup | null;
  }> {
    return this.request<any>(`/buyers/demands/${demandId}/matches`);
  }

  public async sendBuyerOffer(demandId: string, offerData: any): Promise<{ message: string; offer: Offer }> {
    return this.request<{ message: string; offer: Offer }>(`/buyers/demands/${demandId}/offers`, {
      method: 'POST',
      body: JSON.stringify(offerData),
    });
  }

  public async createCollectiveOrder(demandId: string, payload: any): Promise<any> {
    return this.request<any>(`/buyers/demands/${demandId}/collective-order`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async getBuyerOrders(): Promise<Order[]> {
    return this.request<Order[]>('/buyers/orders');
  }

  // Order APIs
  public async getOrder(id: string): Promise<Order> {
    return this.request<Order>(`/orders/${id}`);
  }

  public async updateOrderStatus(id: string, nextStatus: string, details?: any): Promise<any> {
    return this.request<any>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ nextStatus, details }),
    });
  }

  public async raiseDispute(orderId: string, reason: string, evidence?: any): Promise<any> {
    return this.request<any>(`/orders/${orderId}/dispute`, {
      method: 'POST',
      body: JSON.stringify({ reason, evidenceJson: evidence }),
    });
  }

  // Phase 2 Order Lifecycle APIs
  public async acceptOrder(id: string): Promise<{ success: boolean; message: string; order: Order }> {
    return this.request<any>(`/orders/${id}/accept`, { method: 'POST' });
  }

  public async rejectOrder(id: string, reason?: string): Promise<{ success: boolean; message: string; order: Order }> {
    return this.request<any>(`/orders/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  public async cancelOrder(id: string, reason?: string): Promise<{ success: boolean; message: string; order: Order }> {
    return this.request<any>(`/orders/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  public async getOrderTracking(id: string): Promise<any> {
    return this.request<any>(`/orders/${id}/tracking`);
  }

  public async confirmDelivery(id: string, data?: { otp?: string; proofPhotoUrl?: string }): Promise<any> {
    return this.request<any>(`/orders/${id}/confirm-delivery`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  }

  public async submitOrderReview(
    id: string,
    reviewData: {
      score: number;
      qualityScore?: number;
      freshnessScore?: number;
      accuracyScore?: number;
      communicationScore?: number;
      comment?: string;
    }
  ): Promise<any> {
    return this.request<any>(`/orders/${id}/review`, {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  // Logistics APIs
  public async getPickups(): Promise<any[]> {
    return this.request<any[]>('/logistics/pickups');
  }

  public async schedulePickup(data: any): Promise<any> {
    return this.request<any>('/logistics/pickups', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async getDeliveries(): Promise<any[]> {
    return this.request<any[]>('/logistics/deliveries');
  }

  public async updateDeliveryStatus(deliveryId: string, status: string, lat?: number, lng?: number): Promise<any> {
    return this.request<any>(`/logistics/deliveries/${deliveryId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, currentLat: lat, currentLng: lng }),
    });
  }

  public async getVehicles(): Promise<any[]> {
    return this.request<any[]>('/logistics/vehicles');
  }

  public async getCollectionCenters(): Promise<any[]> {
    return this.request<any[]>('/logistics/collection-centers');
  }

  // Quality Check APIs
  public async submitQualityCheck(qcData: any): Promise<any> {
    return this.request<any>('/quality-checks', {
      method: 'POST',
      body: JSON.stringify(qcData),
    });
  }

  // Payment APIs
  public async releasePayment(paymentId: string): Promise<any> {
    return this.request<any>(`/payments/release/${paymentId}`, {
      method: 'POST',
    });
  }

  // Ratings APIs
  public async submitRating(ratingData: { orderId: string; toUserId: string; score: number; comment?: string }): Promise<any> {
    return this.request<any>('/ratings', {
      method: 'POST',
      body: JSON.stringify(ratingData),
    });
  }

  // Coordinator APIs
  public async getCoordinatorFarmers(): Promise<any[]> {
    return this.request<any[]>('/coordinator/farmers');
  }

  public async coordinatorRegisterFarmer(data: any): Promise<any> {
    return this.request<any>('/coordinator/register-farmer', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async coordinatorCreateBatch(data: any): Promise<any> {
    return this.request<any>('/coordinator/create-batch', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Admin APIs
  public async getAdminDashboard(): Promise<any> {
    return this.request<any>('/admin/dashboard');
  }

  public async getAdminFarmers(): Promise<any[]> {
    return this.request<any[]>('/admin/farmers');
  }

  public async getAdminBuyers(): Promise<any[]> {
    return this.request<any[]>('/admin/buyers');
  }

  public async getAdminListings(): Promise<any[]> {
    return this.request<any[]>('/admin/listings');
  }

  public async getAdminOrders(): Promise<any[]> {
    return this.request<any[]>('/admin/orders');
  }

  public async getAdminDisputes(): Promise<any[]> {
    return this.request<any[]>('/admin/disputes');
  }

  public async resolveDispute(disputeId: string, status: string, notes?: string): Promise<any> {
    return this.request<any>(`/admin/disputes/${disputeId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, resolutionNotes: notes }),
    });
  }

  // Notifications APIs
  public async getNotifications(): Promise<NotificationItem[]> {
    return this.request<NotificationItem[]>('/notifications');
  }

  public async markNotificationRead(id: string): Promise<any> {
    return this.request<any>(`/notifications/${id}/read`, { method: 'PATCH' });
  }

  public async markAllNotificationsRead(): Promise<any> {
    return this.request<any>('/notifications/read-all', { method: 'PATCH' });
  }

  // Demo Scenario Simulations
  public async simulateUrgency(batchId?: string): Promise<any> {
    return this.request<any>('/demo/simulate-urgency', {
      method: 'POST',
      body: JSON.stringify({ batchId }),
    });
  }

  public async simulateExpiry(batchId?: string): Promise<any> {
    return this.request<any>('/demo/simulate-expiry', {
      method: 'POST',
      body: JSON.stringify({ batchId }),
    });
  }

  // Daily Live Vegetable Market Prices APIs
  public async getDailyMarketPrices(params?: {
    district?: string;
    mandiId?: string;
    category?: string;
    search?: string;
  }): Promise<{ availableMandis: MandiInfo[]; summary: MandiMarketSummary }> {
    const query = new URLSearchParams();
    if (params?.district) query.set('district', params.district);
    if (params?.mandiId) query.set('mandiId', params.mandiId);
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request<{ availableMandis: MandiInfo[]; summary: MandiMarketSummary }>(
      `/market-prices/daily${qs}`
    );
  }

  public async getMarketTicker(district: string = 'Salem'): Promise<{ ticker: Array<{ name: string; nameTamil: string; price: number; trend: number; isRising: boolean }> }> {
    return this.request<{ ticker: Array<{ name: string; nameTamil: string; price: number; trend: number; isRising: boolean }> }>(
      `/market-prices/ticker?district=${encodeURIComponent(district)}`
    );
  }

  public async getAvailableMandis(): Promise<{ mandis: MandiInfo[] }> {
    return this.request<{ mandis: MandiInfo[] }>('/market-prices/mandis');
  }

  public async syncMarketPrices(): Promise<{ success: boolean; message: string; syncedCount: number; summary: MandiMarketSummary }> {
    return this.request<{ success: boolean; message: string; syncedCount: number; summary: MandiMarketSummary }>('/market-prices/sync', {
      method: 'POST',
    });
  }

  // Photo Upload API
  public async uploadImage(imageBase64: string, filename?: string): Promise<{ url: string; filename: string }> {
    return this.request<{ url: string; filename: string }>('/upload', {
      method: 'POST',
      body: JSON.stringify({ imageBase64, filename }),
    });
  }

  // Cart & Checkout APIs (Mode 1: Direct Purchase)
  public async getCart(deliveryMethod: string = 'STANDARD'): Promise<{
    cartId: string;
    items: Array<{
      id: string;
      batchId: string;
      quantity: number;
      batch: any;
    }>;
    itemCount: number;
    subtotal: number;
    deliveryFee: number;
    deliveryBreakdown?: any;
    total: number;
  }> {
    return this.request<any>(`/buyers/cart?deliveryMethod=${encodeURIComponent(deliveryMethod)}`);
  }

  public async addToCart(batchId: string, quantity: number = 1): Promise<{ message: string; cartItem: any }> {
    return this.request<any>('/buyers/cart/items', {
      method: 'POST',
      body: JSON.stringify({ batchId, quantity }),
    });
  }

  public async updateCartItem(cartItemId: string, quantity: number): Promise<{ message: string; cartItem?: any }> {
    return this.request<any>(`/buyers/cart/items/${cartItemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    });
  }

  public async removeFromCart(cartItemId: string): Promise<{ message: string }> {
    return this.request<any>(`/buyers/cart/items/${cartItemId}`, {
      method: 'DELETE',
    });
  }

  public async clearCart(): Promise<{ message: string }> {
    return this.request<any>('/buyers/cart', {
      method: 'DELETE',
    });
  }

  public async getDeliveryEstimate(data: {
    totalWeightKg?: number;
    originDistrict?: string;
    originVillage?: string;
    batchId?: string;
  }): Promise<{ options: Record<string, any> }> {
    return this.request<any>('/buyers/delivery-estimate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async checkout(data: {
    items: Array<{ batchId: string; quantity: number }>;
    deliveryAddress?: string;
    deliveryMethod?: string;
    paymentMethod?: string;
    notes?: string;
  }): Promise<{ message: string; order: Order }> {
    return this.request<any>('/buyers/checkout', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Wishlist APIs
  public async getWishlist(): Promise<any[]> {
    return this.request<any[]>('/buyers/wishlist');
  }

  public async addToWishlist(data: { batchId?: string; productId?: string }): Promise<any> {
    return this.request<any>('/buyers/wishlist', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async removeFromWishlist(id: string): Promise<any> {
    return this.request<any>(`/buyers/wishlist/${id}`, { method: 'DELETE' });
  }

  // Farmer Cost Tracking APIs
  public async getFarmerCosts(): Promise<{ costs: any[]; totalCosts: number }> {
    return this.request<any>('/farmers/costs');
  }

  public async addFarmerCost(data: {
    category: string;
    amount: number;
    description?: string;
    batchId?: string;
    date?: string;
  }): Promise<any> {
    return this.request<any>('/farmers/costs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async deleteFarmerCost(id: string): Promise<any> {
    return this.request<any>(`/farmers/costs/${id}`, { method: 'DELETE' });
  }

  // Farmer Reputation & Follow APIs
  public async getFarmerReputation(id: string): Promise<any> {
    return this.request<any>(`/farmers/${id}/reputation`);
  }

  public async followFarmer(id: string): Promise<any> {
    return this.request<any>(`/farmers/${id}/follow`, { method: 'POST' });
  }

  public async unfollowFarmer(id: string): Promise<any> {
    return this.request<any>(`/farmers/${id}/unfollow`, { method: 'POST' });
  }

  // Market & Discovery APIs
  public async getProductsWithMarketPrice(district: string = 'Salem'): Promise<any[]> {
    return this.request<any[]>(`/market/products-with-market-price?district=${encodeURIComponent(district)}`);
  }

  public async getNearbyFarmers(lat?: number, lng?: number, maxDistanceKm?: number): Promise<any[]> {
    const params = new URLSearchParams();
    if (lat) params.set('lat', String(lat));
    if (lng) params.set('lng', String(lng));
    if (maxDistanceKm) params.set('maxDistanceKm', String(maxDistanceKm));
    return this.request<any[]>(`/market/nearby-farmers?${params.toString()}`);
  }

  public async getMarketBatchDetail(batchId: string): Promise<any> {
    return this.request<any>(`/market/batches/${batchId}`);
  }

  // Price Alert APIs
  public async getPriceAlerts(): Promise<any[]> {
    return this.request<any[]>('/price-alerts');
  }

  public async createPriceAlert(data: {
    productId: string;
    targetPrice: number;
    condition?: string;
    district?: string;
  }): Promise<any> {
    return this.request<any>('/price-alerts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async deletePriceAlert(id: string): Promise<any> {
    return this.request<any>(`/price-alerts/${id}`, { method: 'DELETE' });
  }

  // Multi-Role & Profile Switch APIs
  public async switchRole(activeRole: string): Promise<{ message: string; token: string; user: User }> {
    const data = await this.request<{ message: string; token: string; user: User }>('/auth/switch-role', {
      method: 'POST',
      body: JSON.stringify({ activeRole }),
    });
    this.setToken(data.token);
    return data;
  }

  public async setupProfile(profileData: any): Promise<{ message: string; token: string; user: User }> {
    const data = await this.request<{ message: string; token: string; user: User }>('/auth/setup-profile', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
    this.setToken(data.token);
    return data;
  }

  // Social Feed & Post APIs
  public async getFeed(params?: { page?: number; limit?: number; cropName?: string }): Promise<{
    posts: Post[];
    page: number;
    limit: number;
    totalCount: number;
    hasMore: boolean;
  }> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.cropName) query.set('cropName', params.cropName);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request<any>(`/posts/feed${qs}`);
  }

  public async createPost(postData: {
    caption: string;
    cropName?: string;
    price?: number;
    quantity?: number;
    unit?: string;
    qualityGrade?: string;
    harvestDate?: string;
    location?: string;
    batchId?: string;
    mediaUrls?: string[];
  }): Promise<{ message: string; post: Post }> {
    return this.request<any>('/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  public async getPost(id: string): Promise<Post> {
    return this.request<Post>(`/posts/${id}`);
  }

  public async deletePost(id: string): Promise<{ message: string }> {
    return this.request<any>(`/posts/${id}`, { method: 'DELETE' });
  }

  public async likePost(id: string): Promise<{ message: string; liked: boolean; likeCount: number }> {
    return this.request<any>(`/posts/${id}/like`, { method: 'POST' });
  }

  public async unlikePost(id: string): Promise<{ message: string; liked: boolean; likeCount: number }> {
    return this.request<any>(`/posts/${id}/like`, { method: 'DELETE' });
  }

  public async getPostComments(postId: string, page: number = 1): Promise<{
    comments: PostComment[];
    totalCount: number;
    page: number;
    hasMore: boolean;
  }> {
    return this.request<any>(`/posts/${postId}/comments?page=${page}`);
  }

  public async addPostComment(postId: string, content: string): Promise<{ message: string; comment: PostComment }> {
    return this.request<any>(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  public async deletePostComment(commentId: string): Promise<{ message: string }> {
    return this.request<any>(`/posts/comments/${commentId}`, { method: 'DELETE' });
  }

  public async replyPostComment(commentId: string, content: string): Promise<{ message: string; reply: any }> {
    return this.request<any>(`/posts/comments/${commentId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  public async deletePostCommentReply(replyId: string): Promise<{ message: string }> {
    return this.request<any>(`/posts/comments/replies/${replyId}`, { method: 'DELETE' });
  }

  // Public Farmer Profile API
  public async getFarmerPublicProfile(id: string): Promise<{
    farmer: any;
    produceBatches: any[];
    posts: Post[];
    reviews: any[];
  }> {
    return this.request<any>(`/farmers/${id}/public-profile`);
  }

  // Direct Chat APIs
  public async getConversations(): Promise<{ conversations: Conversation[] }> {
    return this.request<any>('/chat/conversations');
  }

  public async startConversation(targetUserId: string): Promise<{ conversation: any }> {
    return this.request<any>('/chat/conversations', {
      method: 'POST',
      body: JSON.stringify({ targetUserId }),
    });
  }

  public async getChatMessages(conversationId: string, page: number = 1): Promise<{
    messages: Message[];
    totalCount: number;
    page: number;
    hasMore: boolean;
  }> {
    return this.request<any>(`/chat/conversations/${conversationId}/messages?page=${page}`);
  }

  public async sendChatMessage(
    conversationId: string,
    content: string,
    attachments?: any[]
  ): Promise<{ message: Message }> {
    return this.request<any>(`/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content, attachments }),
    });
  }

  public async markChatRead(conversationId: string): Promise<{ success: boolean }> {
    return this.request<any>(`/chat/conversations/${conversationId}/read`, {
      method: 'PATCH',
    });
  }
}

export const api = new ApiService();
export default api;
