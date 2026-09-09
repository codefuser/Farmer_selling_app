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
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

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
}

export const api = new ApiService();
export default api;
