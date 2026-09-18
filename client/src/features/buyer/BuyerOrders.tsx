import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Order } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useRealtime } from '../../context/RealtimeContext';
import DeliveryMap from '../../components/common/DeliveryMap';
import {
  Truck,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Star,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Users,
  AlertCircle,
  Play,
  ArrowRight,
  XCircle,
  Check,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

const ORDER_STEPS = [
  'ORDERED',
  'ACCEPTED',
  'PICKUP_SCHEDULED',
  'COLLECTED',
  'QUALITY_CHECKED',
  'PACKED',
  'DISPATCHED',
  'DELIVERED',
  'PAYMENT_RELEASED',
  'COMPLETED',
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
  const [advancingStatus, setAdvancingStatus] = useState(false);

  // Cancellation Modal State
  const [cancelModalOrder, setCancelModalOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('Change of plan / requirements');
  const [isCancelling, setIsCancelling] = useState(false);

  // Delivery Confirmation State
  const [confirmingDelivery, setConfirmingDelivery] = useState<string | null>(null);

  // Multi-Dimensional Rating State
  const [ratingModalOrder, setRatingModalOrder] = useState<Order | null>(null);
  const [ratingScores, setRatingScores] = useState({
    overall: 5,
    quality: 5,
    freshness: 5,
    accuracy: 5,
    communication: 5,
  });
  const [ratingComment, setRatingComment] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [ratingSuccessToast, setRatingSuccessToast] = useState(false);

  const getStageLabel = (step: string) => {
    const map: Record<string, { en: string; ta: string }> = {
      ORDERED: { en: 'Order Placed', ta: 'ஆர்டர் செய்யப்பட்டது' },
      ACCEPTED: { en: 'Accepted by Farmer', ta: 'விவசாயியால் ஏற்கப்பட்டது' },
      PICKUP_SCHEDULED: { en: 'Pickup Scheduled', ta: 'வாகனம் திட்டமிடப்பட்டது' },
      COLLECTED: { en: 'Collected from Farm', ta: 'பண்ணையில் சேகரிக்கப்பட்டது' },
      QUALITY_CHECKED: { en: 'Quality Verified', ta: 'தரச் சோதனை நிறைவு' },
      PACKED: { en: 'Packed & Barcoded', ta: 'பொதியிடப்பட்டது' },
      DISPATCHED: { en: 'Dispatched', ta: 'வண்டியில் அனுப்பப்பட்டது' },
      DELIVERED: { en: 'Delivered', ta: 'வழங்கப்பட்டது' },
      PAYMENT_RELEASED: { en: 'Payment Released', ta: 'பணம் விடுவிக்கப்பட்டது' },
      COMPLETED: { en: 'Completed', ta: 'முழுமை பெற்றது' },
      CANCELLED: { en: 'Cancelled', ta: 'ரத்து செய்யப்பட்டது' },
    };
    return language === 'ta' ? map[step]?.ta || step : map[step]?.en || step;
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await api.getBuyerOrders();
      setOrders(res);
      if (res.length > 0 && !expandedOrderId) {
        setExpandedOrderId(res[0].id);
      }
    } catch (err) {
      console.error('Error loading buyer orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Listen to live order status updates via Realtime SSE!
  useEffect(() => {
    const unsubscribe = subscribe('order_status_update', (data: any) => {
      console.log('Realtime order update received:', data);
      loadOrders();
    });
    return () => unsubscribe();
  }, [subscribe]);

  useEffect(() => {
    if (highlightOrderId) {
      setExpandedOrderId(highlightOrderId);
    }
  }, [highlightOrderId]);

  // Advance Order Status (Simulator for Demonstration)
  const handleAdvanceOrder = async (order: Order) => {
    const currentIndex = ORDER_STEPS.indexOf(order.status);
    if (currentIndex < ORDER_STEPS.length - 1) {
      const nextStatus = ORDER_STEPS[currentIndex + 1];
      try {
        setAdvancingStatus(true);
        await api.updateOrderStatus(order.id, nextStatus);
        await loadOrders();
      } catch (err: any) {
        alert(err.message || 'Failed to advance status');
      } finally {
        setAdvancingStatus(false);
      }
    }
  };

  // Cancel Order Handler
  const handleCancelOrderSubmit = async () => {
    if (!cancelModalOrder) return;
    setIsCancelling(true);
    try {
      await api.cancelOrder(cancelModalOrder.id, cancelReason);
      setCancelModalOrder(null);
      await loadOrders();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel order');
    } finally {
      setIsCancelling(false);
    }
  };

  // Confirm Delivery & Release Escrow Handler
  const handleConfirmDelivery = async (orderId: string) => {
    setConfirmingDelivery(orderId);
    try {
      await api.confirmDelivery(orderId, { otp: 'VERIFIED_BY_BUYER' });
      await loadOrders();
      alert(
        language === 'ta'
          ? 'டெலிவரி உறுதி செய்யப்பட்டது! எஸ்க்ரோ கட்டணம் விவசாயிக்கு விடுவிக்கப்பட்டது.'
          : 'Delivery confirmed! Escrow payout released to the farmer.'
      );
    } catch (err: any) {
      alert(err.message || 'Failed to confirm delivery');
    } finally {
      setConfirmingDelivery(null);
    }
  };

  // Submit Multi-Criteria Review
  const handleSubmitReview = async () => {
    if (!ratingModalOrder) return;
    setIsSubmittingRating(true);
    try {
      await api.submitOrderReview(ratingModalOrder.id, {
        score: ratingScores.overall,
        qualityScore: ratingScores.quality,
        freshnessScore: ratingScores.freshness,
        accuracyScore: ratingScores.accuracy,
        communicationScore: ratingScores.communication,
        comment: ratingComment.trim() || undefined,
      });

      setRatingModalOrder(null);
      setRatingSuccessToast(true);
      setTimeout(() => setRatingSuccessToast(false), 3000);
      await loadOrders();
    } catch (err: any) {
      alert(err.message || 'Failed to submit review');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Page Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            {language === 'ta' ? 'ஆர்டர்கள் மற்றும் நேரடி கண்காணிப்பு' : 'Procurement Orders & Live Tracking'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'ta'
              ? 'நேரடி பரிவர்த்தனை நிலை, GPS கண்காணிப்பு மற்றும் எஸ்க்ரோ பாதுகாப்பு'
              : 'Real-time order lifecycle, GPS driver telemetry, and escrow milestone release'}
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

      {ratingSuccessToast && (
        <div className="p-3 bg-emerald-600 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-md animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{language === 'ta' ? 'விவசாயிக்கான மதிப்பீடு பதிவு செய்யப்பட்டது! நன்றி.' : 'Review submitted! Farmer rating updated.'}</span>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">
            {language === 'ta' ? 'ஆர்டர்கள் பெறப்படுகின்றன...' : 'Loading orders...'}
          </p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center text-slate-500 border border-slate-200 max-w-md mx-auto space-y-3">
          <Truck className="w-12 h-12 mx-auto text-slate-300" />
          <h3 className="font-extrabold text-slate-800 text-sm">
            {language === 'ta' ? 'ஆர்டர்கள் எதுவும் இல்லை' : 'No orders yet'}
          </h3>
          <p className="text-xs text-slate-500">
            {language === 'ta'
              ? 'புதிய காய்கறிகளை சந்தையில் வாங்குங்கள் அல்லது மொத்த தேவையை பதிவிடுங்கள்.'
              : 'Explore the marketplace or post a bulk demand to place an order.'}
          </p>
          <button
            onClick={() => onNavigate('buyer-marketplace')}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            {language === 'ta' ? 'சந்தைக்குச் செல்' : 'Go to Marketplace'}
          </button>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const currentStepIdx = ORDER_STEPS.indexOf(order.status);
            const isCancelled = order.status === 'CANCELLED';
            const canCancel = ['ORDERED', 'ACCEPTED'].includes(order.status);
            const canConfirmDelivery = order.status === 'DISPATCHED';
            const canReview = ['DELIVERED', 'PAYMENT_RELEASED', 'COMPLETED'].includes(order.status);

            return (
              <div
                key={order.id}
                className={`bg-white rounded-3xl p-4 sm:p-6 border transition shadow-sm space-y-4 ${
                  isExpanded ? 'border-emerald-500 ring-2 ring-emerald-500/10' : 'border-slate-200'
                }`}
              >
                {/* Header Strip */}
                <div
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 cursor-pointer select-none"
                  onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                        #{order.orderCode}
                      </span>
                      {order.deliveryMethod && (
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-full">
                          {order.deliveryMethod.replace('_', ' ')}
                        </span>
                      )}
                      {order.collectiveOrderId && (
                        <span className="text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded-full">
                          {language === 'ta' ? 'கூட்டு கொள்முதல்' : 'Collective Pool'}
                        </span>
                      )}
                    </div>
                    <h3 className="font-black text-sm sm:text-base text-slate-900">
                      {order.totalQuantity} kg • ₹{order.totalAmount?.toLocaleString('en-IN')}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase ${
                        isCancelled
                          ? 'bg-rose-100 text-rose-800'
                          : order.status === 'COMPLETED' || order.status === 'DELIVERED'
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

                {/* Progress Stepper (if not cancelled) */}
                {!isCancelled ? (
                  <div className="overflow-x-auto pt-2 pb-2 -mx-2 px-2 no-scrollbar">
                    <div className="flex items-center min-w-[650px] justify-between relative px-2">
                      {ORDER_STEPS.map((stepName, sIdx) => {
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
                              className={`text-[9px] font-semibold mt-1.5 text-center leading-tight max-w-[65px] ${
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
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-rose-600" />
                      <span>
                        {language === 'ta' ? 'ஆர்டர் ரத்து செய்யப்பட்டது: ' : 'Order Cancelled: '}
                        {order.cancellationReason || 'Cancelled before dispatch'}
                      </span>
                    </div>
                    <span className="font-bold text-[10px] bg-rose-200/80 px-2 py-0.5 rounded-full">
                      Refund Processed
                    </span>
                  </div>
                )}

                {/* Action Toolbar (Phase 2) */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {canConfirmDelivery && (
                    <button
                      onClick={() => handleConfirmDelivery(order.id)}
                      disabled={confirmingDelivery === order.id}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 active:scale-95"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{language === 'ta' ? 'டெலிவரி உறுதி செய் & பணம் விடுவி' : 'Confirm Delivery & Release Escrow'}</span>
                    </button>
                  )}

                  {canReview && (
                    <button
                      onClick={() => {
                        setRatingModalOrder(order);
                        setRatingScores({ overall: 5, quality: 5, freshness: 5, accuracy: 5, communication: 5 });
                        setRatingComment('');
                      }}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 active:scale-95"
                    >
                      <Star className="w-3.5 h-3.5 fill-white" />
                      <span>{language === 'ta' ? 'விவசாயிக்கு மதிப்புரை வழங்குக' : 'Rate & Review'}</span>
                    </button>
                  )}

                  {canCancel && (
                    <button
                      onClick={() => setCancelModalOrder(order)}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl transition flex items-center gap-1.5 active:scale-95"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>{language === 'ta' ? 'ஆர்டரை ரத்து செய்' : 'Cancel Order'}</span>
                    </button>
                  )}
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div className="pt-4 border-t border-slate-100 space-y-5 animate-in fade-in duration-200">
                    {/* Simulator Stage Advancer */}
                    {!isCancelled && (
                      <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
                        <div className="flex items-center gap-2">
                          <Play className="w-4 h-4 text-emerald-700 shrink-0" />
                          <span className="font-semibold text-emerald-900">
                            {language === 'ta'
                              ? 'டெமோ நிலை மாற்றம்: அடுத்த கட்டத்திற்கு நகர்த்தவும்'
                              : 'Workflow Simulator: Advance status in order state machine'}
                          </span>
                        </div>
                        <button
                          onClick={() => handleAdvanceOrder(order)}
                          disabled={advancingStatus || currentStepIdx >= ORDER_STEPS.length - 1}
                          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow transition disabled:opacity-50 flex items-center gap-1.5 self-stretch sm:self-auto justify-center active:scale-95"
                        >
                          <span>
                            {language === 'ta' ? 'அடுத்த நிலை' : 'Advance to'}{' '}
                            {currentStepIdx < ORDER_STEPS.length - 1
                              ? getStageLabel(ORDER_STEPS[currentStepIdx + 1])
                              : (language === 'ta' ? 'முடிவடைந்தது' : 'Completed')}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Contributing Farmers Breakdown */}
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-emerald-600" />
                        <span>
                          {language === 'ta' ? 'பங்கேற்கும் விவசாயிகளின் பங்கு விவரம்' : 'Participating Farmer Supply Breakdown'}
                        </span>
                      </h4>
                      <div className="bg-slate-50 rounded-2xl p-3 sm:p-4 border border-slate-200/80 overflow-x-auto">
                        <table className="w-full text-left text-xs min-w-[420px]">
                          <thead>
                            <tr className="text-slate-400 border-b border-slate-200 pb-2">
                              <th className="font-semibold pb-2">{language === 'ta' ? 'விவசாயி' : 'Farmer'}</th>
                              <th className="font-semibold pb-2">{language === 'ta' ? 'தொகுதி எண்' : 'Batch Code'}</th>
                              <th className="font-semibold pb-2">{language === 'ta' ? 'அளவு' : 'Quantity'}</th>
                              <th className="font-semibold pb-2">{language === 'ta' ? 'விலை' : 'Price'}</th>
                              <th className="font-semibold pb-2">{language === 'ta' ? 'விவசாயி பங்கு' : 'Farmer Payout'}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200/50 font-medium">
                            {order.items?.map((item) => (
                              <tr key={item.id}>
                                <td className="py-2.5 font-bold text-slate-800">
                                  {item.farmer?.user?.name || (language === 'ta' ? 'விவசாயி' : 'Farmer')}
                                </td>
                                <td className="py-2.5 font-mono text-slate-500">{item.batch?.batchCode}</td>
                                <td className="py-2.5 font-bold text-emerald-700">{item.quantity} kg</td>
                                <td className="py-2.5 text-slate-700">₹{item.pricePerKg}/kg</td>
                                <td className="py-2.5 font-bold text-slate-900">
                                  ₹{(item.total * 0.98).toFixed(0)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Live Logistics Route Map */}
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{language === 'ta' ? 'நேரடி வாகன வரைபடம்' : 'Logistics Telemetry & Delivery Map'}</span>
                      </h4>
                      <DeliveryMap
                        orderCode={order.orderCode}
                        status={order.status}
                        destinationName={order.deliveryAddress}
                      />
                    </div>

                    {/* Escrow Payment Summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <span className="text-slate-400 text-[10px] block font-bold">
                          {language === 'ta' ? 'பொருட்கள் மதிப்பு' : 'Items Subtotal'}
                        </span>
                        <span className="text-base font-black text-slate-900">
                          ₹{(order.totalAmount - (order.deliveryFee || 0)).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <span className="text-slate-400 text-[10px] block font-bold">
                          {language === 'ta' ? 'டெலிவரி கட்டணம்' : 'Delivery Fee'}
                        </span>
                        <span className="text-base font-bold text-slate-700">
                          ₹{order.deliveryFee || 0}
                        </span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <span className="text-slate-400 text-[10px] block font-bold">
                          {language === 'ta' ? 'தளக் கட்டணம் (2%)' : 'Platform Fee (2%)'}
                        </span>
                        <span className="text-base font-bold text-slate-600">
                          ₹{order.platformFee?.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
                        <span className="text-emerald-700 text-[10px] block font-bold">
                          {language === 'ta' ? 'எஸ்க்ரோ நிலை' : 'Escrow Status'}
                        </span>
                        <span className="text-base font-black text-emerald-900">
                          {['DELIVERED', 'PAYMENT_RELEASED', 'COMPLETED'].includes(order.status)
                            ? (language === 'ta' ? 'விவசாயிக்கு வழங்கப்பட்டது ✓' : 'Released to Farmers ✓')
                            : (language === 'ta' ? 'பாதுகாப்பாக உள்ளது 🔒' : 'Authorized in Escrow 🔒')}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Modal */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-600" />
              <span>{language === 'ta' ? 'ஆர்டரை ரத்து செய்தல்' : 'Cancel Order'} #{cancelModalOrder.orderCode}</span>
            </h3>

            <p className="text-xs text-slate-600">
              {language === 'ta'
                ? 'ஆர்டர் ரத்து செய்யப்பட்டால், விளைபொருட்கள் மீண்டும் விவசாயியின் கையிருப்புக்கு மாற்றப்பட்டு உங்கள் பணம் முழுமையாக திருப்பித் தரப்படும்.'
                : 'Cancelling this order will restore the batch quantity for the farmer and immediately refund any authorized escrow payment.'}
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                {language === 'ta' ? 'ரத்து செய்வதற்கான காரணம்' : 'Reason for Cancellation'}
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-slate-50 focus:bg-white outline-none"
              >
                <option value="Change of plan / requirements">Change of plan / requirements</option>
                <option value="Ordered wrong quantity">Ordered wrong quantity</option>
                <option value="Alternative source arranged">Alternative source arranged</option>
                <option value="Delivery address change">Delivery address change</option>
                <option value="Other reason">Other reason</option>
              </select>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalOrder(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
              >
                {language === 'ta' ? 'பின்செல்' : 'Go Back'}
              </button>
              <button
                type="button"
                disabled={isCancelling}
                onClick={handleCancelOrderSubmit}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow transition disabled:opacity-50"
              >
                {isCancelling ? 'Processing...' : (language === 'ta' ? 'உறுதி செய் & ரத்து செய்' : 'Confirm Cancellation')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Dimensional Rating Modal (Phase 2) */}
      {ratingModalOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>{language === 'ta' ? 'விவசாயி தரம் மற்றும் மதிப்புரை' : 'Rate & Review Produce'}</span>
            </h3>

            <p className="text-xs text-slate-600">
              {language === 'ta'
                ? 'உங்கள் உண்மையான மதிப்பீடு விவசாயிகளுக்கு நியாயமான நன்மதிப்பை உருவாக்குகிறது.'
                : 'Multi-criteria rating ensures transparency and directly impacts the farmer reputation score.'}
            </p>

            {/* Criteria Sliders/Buttons */}
            <div className="space-y-3 pt-1">
              {[
                { key: 'overall', label: 'Overall Experience' },
                { key: 'quality', label: 'Product Quality' },
                { key: 'freshness', label: 'Freshness' },
                { key: 'accuracy', label: 'Weight & Grading Accuracy' },
                { key: 'communication', label: 'Farmer Communication' },
              ].map((crit) => (
                <div key={crit.key} className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">{crit.label}</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() =>
                          setRatingScores((prev) => ({ ...prev, [crit.key]: val }))
                        }
                        className="p-1 focus:outline-none"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            val <= (ratingScores as any)[crit.key]
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-200'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Written Comment */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                {language === 'ta' ? 'உங்கள் கருத்து' : 'Review Comment'}
              </label>
              <textarea
                rows={3}
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                placeholder={
                  language === 'ta'
                    ? 'விளைபொருளின் சுவை, புத்துணர்ச்சி பற்றி சுருக்கமாக எழுதவும்...'
                    : 'Share details about produce freshness, packaging, and timely dispatch...'
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-slate-50 focus:bg-white outline-none resize-none"
              />
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setRatingModalOrder(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
              >
                {language === 'ta' ? 'ரத்து' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={isSubmittingRating}
                onClick={handleSubmitReview}
                className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow transition disabled:opacity-50"
              >
                {isSubmittingRating ? 'Submitting...' : (language === 'ta' ? 'சமர்ப்பி' : 'Submit Review')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyerOrders;
