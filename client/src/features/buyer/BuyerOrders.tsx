import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Order } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useRealtime } from '../../context/RealtimeContext';
import {
  Truck,
  CheckCircle2,
  Clock,
  ShieldCheck,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  XCircle,
  Package,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  MapPin,
  KeyRound,
  Phone,
  AlertCircle,
} from 'lucide-react';

const ULAVAR_STEPS = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'PACKED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];

interface BuyerOrdersProps {
  highlightOrderId?: string;
  onNavigate: (view: string, params?: any) => void;
}

export const BuyerOrders: React.FC<BuyerOrdersProps> = ({ highlightOrderId, onNavigate }) => {
  const { language, t } = useLanguage();
  const { subscribe } = useRealtime();

  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(highlightOrderId || null);
  const [loading, setLoading] = useState(true);

  // Cancellation Modal
  const [cancelModalOrder, setCancelModalOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('Found another option / Need to change order items');
  const [isCancelling, setIsCancelling] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const getStageLabel = (step: string) => {
    const map: Record<string, { en: string; ta: string }> = {
      PENDING: { en: 'Order Placed', ta: 'ஆர்டர் பெறப்பட்டது' },
      CONFIRMED: { en: 'Hub Confirmed', ta: 'மத்திய மையம் உறுதிசெய்தது' },
      PROCESSING: { en: 'Hub Quality Check', ta: 'தர சோதனை & பேக்கிங்' },
      PACKED: { en: 'Ready for Dispatch', ta: 'அனுப்ப தயார்' },
      DISPATCHED: { en: 'Dispatched', ta: 'வண்டியில் அனுப்பப்பட்டது' },
      OUT_FOR_DELIVERY: { en: 'Out for Delivery', ta: 'டெலிவரிக்கு புறப்பட்டது' },
      DELIVERED: { en: 'Delivered', ta: 'வீட்டில் வழங்கப்பட்டது' },
      COMPLETED: { en: 'Completed', ta: 'நிறைவு பெற்றது' },
      CANCELLED: { en: 'Cancelled', ta: 'ரத்து செய்யப்பட்டது' },
    };
    return language === 'ta' ? map[step]?.ta || step : map[step]?.en || step;
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await api.getCustomerOrders();
      setOrders(res || []);
      if (res && res.length > 0 && !expandedOrderId) {
        setExpandedOrderId(res[0].id);
      }
    } catch (err) {
      console.error('Error loading customer orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Listen to live realtime SSE updates
  useEffect(() => {
    const unsubscribe = subscribe('order_status_update', () => {
      loadOrders();
    });
    return () => unsubscribe();
  }, [subscribe]);

  useEffect(() => {
    if (highlightOrderId) {
      setExpandedOrderId(highlightOrderId);
    }
  }, [highlightOrderId]);

  // Handle Cancel Order
  const handleCancelOrderSubmit = async () => {
    if (!cancelModalOrder) return;
    setIsCancelling(true);
    try {
      await api.cancelCustomerOrder(cancelModalOrder.id, cancelReason);
      setCancelModalOrder(null);
      showToast(
        language === 'ta'
          ? 'ஆர்டர் ரத்து செய்யப்பட்டு, சரக்ககத்தில் இருப்பு மீட்டமைக்கப்பட்டது.'
          : 'Order cancelled successfully and stock restored to inventory.'
      );
      await loadOrders();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel order');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl border border-emerald-500/40 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            {language === 'ta' ? 'என் ஆர்டர்கள் & நேரடி டெலிவரி நிலை' : 'My Orders & Live Delivery Tracking'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'ta'
              ? 'உழவர் to உலகம் மத்திய சரக்கக நேரடி பேக்கிங் மற்றும் OTP டெலிவரி பாதுகாப்பு'
              : 'Direct Central Hub fulfillment, assigned driver tracking, and secure OTP verification'}
          </p>
        </div>

        <button
          onClick={loadOrders}
          className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 transition"
          title="Refresh orders"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading your orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center text-slate-500 border border-slate-200 max-w-md mx-auto space-y-4">
          <ShoppingBag className="w-12 h-12 mx-auto text-slate-300" />
          <div>
            <h3 className="font-bold text-slate-900 text-sm">No Orders Placed Yet</h3>
            <p className="text-xs text-slate-400 mt-1">
              Browse our fresh produce store to order farm-fresh harvest directly to your home.
            </p>
          </div>
          <button
            onClick={() => onNavigate('buyer-marketplace')}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm transition"
          >
            Explore Fresh Store
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => {
            const isExpanded = expandedOrderId === order.id;
            const isCancelled = order.status === 'CANCELLED';
            const canCancel = ['PENDING', 'CONFIRMED'].includes(order.status);
            const currentStepIdx = ULAVAR_STEPS.indexOf(order.status);
            const deliveryAssignment = order.deliveryAssignment;

            return (
              <div
                key={order.id}
                className={`bg-white rounded-3xl p-4 sm:p-6 border transition shadow-sm space-y-4 ${
                  isExpanded ? 'border-emerald-500 ring-2 ring-emerald-500/10' : 'border-slate-200'
                }`}
              >
                {/* Header Summary */}
                <div
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 cursor-pointer select-none"
                  onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                        #{order.orderCode}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(order.createdAt).toLocaleDateString()} at{' '}
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                        Central Hub Fulfillment
                      </span>
                    </div>

                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                      {order.totalQuantity} kg • ₹{order.totalAmount?.toLocaleString('en-IN')}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase ${
                        isCancelled
                          ? 'bg-rose-100 text-rose-800'
                          : order.status === 'DELIVERED' || order.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}
                    >
                      {getStageLabel(order.status)}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* 6-Stage Progress Stepper */}
                {!isCancelled ? (
                  <div className="overflow-x-auto pt-2 pb-2 -mx-2 px-2 no-scrollbar">
                    <div className="flex items-center min-w-[550px] justify-between relative px-2">
                      {ULAVAR_STEPS.map((stepName, sIdx) => {
                        const isDone = sIdx <= currentStepIdx;
                        const isCurrent = sIdx === currentStepIdx;

                        return (
                          <div key={sIdx} className="flex flex-col items-center relative z-10 flex-1">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition ${
                                isDone
                                  ? 'bg-emerald-600 border-emerald-600 text-white shadow'
                                  : 'bg-white border-slate-300 text-slate-400'
                              } ${isCurrent ? 'ring-4 ring-emerald-500/20 scale-110' : ''}`}
                            >
                              {isDone ? '✓' : sIdx + 1}
                            </div>
                            <span
                              className={`text-[10px] font-semibold mt-1.5 text-center leading-tight max-w-[70px] ${
                                isCurrent
                                  ? 'text-emerald-800 font-extrabold'
                                  : isDone
                                  ? 'text-slate-700'
                                  : 'text-slate-400'
                              }`}
                            >
                              {getStageLabel(stepName)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>
                      {language === 'ta' ? 'ரத்து செய்யப்பட்டது: ' : 'Order Cancelled: '}
                      {order.cancellationReason || 'Cancelled before dispatch'}
                    </span>
                  </div>
                )}

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="pt-4 border-t border-slate-100 space-y-4 animate-in fade-in">
                    {/* Delivery Partner & OTP Banner */}
                    {deliveryAssignment && (
                      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="space-y-1">
                          <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5" />
                            <span>Assigned Delivery Partner</span>
                          </div>
                          <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <span>{deliveryAssignment.driver?.name || 'Karthik Murugan'}</span>
                            <span className="text-xs text-slate-500 font-normal">
                              ({deliveryAssignment.driver?.mobile || '+91 98765 43213'})
                            </span>
                          </div>
                          <div className="text-xs text-slate-600">
                            Logistics Status:{' '}
                            <span className="font-bold text-emerald-800">
                              {deliveryAssignment.status}
                            </span>
                          </div>
                        </div>

                        {/* Secure OTP Pill */}
                        {deliveryAssignment.confirmationOtp && order.status !== 'DELIVERED' && (
                          <div className="bg-white px-4 py-2.5 rounded-xl border-2 border-emerald-500 text-center shadow-md shrink-0">
                            <div className="text-[10px] font-black uppercase text-emerald-800 flex items-center justify-center gap-1">
                              <KeyRound className="w-3 h-3" />
                              <span>Your Delivery OTP</span>
                            </div>
                            <div className="text-xl font-mono font-black text-slate-900 tracking-widest mt-0.5">
                              {deliveryAssignment.confirmationOtp}
                            </div>
                            <div className="text-[9px] text-slate-500">
                              Share with partner upon delivery
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Order Items Table */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Purchased Items ({order.items?.length || 0})
                      </h4>
                      <div className="divide-y divide-slate-200/60 text-xs">
                        {order.items?.map((it: any) => (
                          <div key={it.id} className="py-2.5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 overflow-hidden shrink-0">
                                <img
                                  src={it.product?.images?.[0] || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200'}
                                  alt={it.productName || it.product?.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <div className="font-bold text-slate-900">
                                  {it.productName || it.product?.name}
                                </div>
                                <div className="text-[11px] text-slate-500">
                                  {it.quantity} {it.unit || 'kg'} @ ₹{it.pricePerKg}/{it.unit || 'kg'}
                                </div>
                              </div>
                            </div>
                            <div className="font-bold text-slate-900">
                              ₹{it.total}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Pricing Summary */}
                      <div className="pt-3 border-t border-slate-200 space-y-1 text-xs">
                        <div className="flex justify-between text-slate-600">
                          <span>Subtotal</span>
                          <span className="font-semibold text-slate-800">
                            ₹{order.subtotal || order.totalAmount}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Hub Packaging & Delivery</span>
                          <span className="font-semibold text-slate-800">
                            {order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-200">
                          <span>Total Paid</span>
                          <span className="text-emerald-800">₹{order.totalAmount}</span>
                        </div>
                      </div>
                    </div>

                    {/* Delivery Address & Metadata */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                        <div className="font-bold text-slate-700 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Delivery Address</span>
                        </div>
                        <p className="text-slate-600 leading-relaxed">
                          {order.deliveryAddress || 'Address on file'}
                        </p>
                      </div>

                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                        <div className="font-bold text-slate-700 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Payment Status</span>
                        </div>
                        <p className="text-slate-600">
                          Method: <strong>{order.paymentMethod || 'UPI Pre-paid'}</strong> · Status:{' '}
                          <span className="text-emerald-700 font-bold">{order.paymentStatus || 'PAID'}</span>
                        </p>
                      </div>
                    </div>

                    {/* Action Bar (Cancel Order if applicable) */}
                    {canCancel && (
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => setCancelModalOrder(order)}
                          className="px-4 py-2 border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-bold transition"
                        >
                          Cancel Order & Restore Stock
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Modal */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-2.5 text-rose-700">
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-bold text-base text-slate-900">Cancel Order #{cancelModalOrder.orderCode}?</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Cancelling will immediately restore all purchased produce items back to Ulavar2Ulagam Central Inventory so they are available for other households.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Reason for cancellation</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setCancelModalOrder(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrderSubmit}
                disabled={isCancelling}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
              >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyerOrders;
