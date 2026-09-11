import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Order, OrderStatus } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import DeliveryMap from '../../components/common/DeliveryMap';
import {
  Truck,
  CheckCircle2,
  Clock,
  Warehouse,
  ShieldCheck,
  Star,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Building,
  Users,
  AlertCircle,
  Play,
  ArrowRight,
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
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(highlightOrderId || null);
  const [loading, setLoading] = useState(true);
  const [advancingStatus, setAdvancingStatus] = useState(false);
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingComment, setRatingComment] = useState(
    language === 'ta' ? 'அதிகாலை அறுவடை, சிறந்த தரம் மற்றும் புதிய சுவை.' : 'Excellent fresh morning harvest, firm quality.'
  );
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

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
    };
    return language === 'ta' ? map[step]?.ta || step : map[step]?.en || step;
  };

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    if (highlightOrderId) {
      setExpandedOrderId(highlightOrderId);
    }
  }, [highlightOrderId]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await api.getBuyerOrders();
      setOrders(res);
      if (res.length > 0 && !expandedOrderId) {
        setExpandedOrderId(res[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

  const handleRatingSubmit = async (orderId: string, farmerUserId: string) => {
    try {
      await api.submitRating({
        orderId,
        toUserId: farmerUserId,
        score: ratingScore,
        comment: ratingComment,
      });
      setRatingSubmitted(true);
      alert(
        language === 'ta'
          ? 'விவசாயிக்கான மதிப்பீடு பதிவு செய்யப்பட்டது! நன்றி.'
          : 'Rating submitted successfully! Thank you for rating the farmers.'
      );
    } catch (err: any) {
      alert(err.message || 'Failed to submit rating');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            {language === 'ta' ? 'ஆர்டர்கள் மற்றும் நேரடி கண்காணிப்பு' : 'Procurement Orders & Live Tracking'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'ta'
              ? '10-நிலை ஆர்டர் சுழற்சி, பண்ணை சேகரிப்பு சரிபார்ப்பு, GPS வழித்தடம் மற்றும் எஸ்க்ரோ விடுவிப்பு'
              : 'End-to-end 10-stage order fulfillment, collection verification, GPS tracking, and escrow release'}
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
                      {order.collectiveOrderId && (
                        <span className="text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded-full">
                          {language === 'ta' ? 'கூட்டு கொள்முதல்' : 'Collective Pool Order'}
                        </span>
                      )}
                    </div>
                    <h3 className="font-black text-sm sm:text-base text-slate-900">
                      {order.totalQuantity} kg {language === 'ta' ? 'விளைபொருள்' : 'Produce'} • ₹{order.totalAmount?.toLocaleString('en-IN')}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase ${
                        order.status === 'COMPLETED' || order.status === 'DELIVERED'
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

                {/* 10-Step State Machine Progress Stepper */}
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

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div className="pt-4 border-t border-slate-100 space-y-5 animate-in fade-in duration-200">
                    {/* Demo Pipeline Advancer Button */}
                    <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
                      <div className="flex items-center gap-2">
                        <Play className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span className="font-semibold text-emerald-900">
                          {language === 'ta'
                            ? 'டெமோ நிலை மாற்றம்: ஆர்டரை அடுத்த கட்டத்திற்கு நகர்த்தவும்'
                            : 'Interactive Evaluator Tool: Advance this order to next stage'}
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

                    {/* Contributing Farmers Allocation Table */}
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
                              <th className="font-semibold pb-2">{language === 'ta' ? 'ஒப்புக்கொண்ட விலை' : 'Agreed Price'}</th>
                              <th className="font-semibold pb-2">{language === 'ta' ? 'விவசாயி வருவாய்' : 'Farmer Payout'}</th>
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
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <span className="text-slate-400 text-[10px] block font-bold">
                          {language === 'ta' ? 'மொத்த ஆர்டர் மதிப்பு' : 'Total Order Value'}
                        </span>
                        <span className="text-base font-black text-slate-900">
                          ₹{order.totalAmount?.toLocaleString('en-IN')}
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
                          {order.status === 'DELIVERED' || order.status === 'PAYMENT_RELEASED' || order.status === 'COMPLETED'
                            ? (language === 'ta' ? 'விவசாயிக்கு வழங்கப்பட்டது ✓' : 'Released to Farmers ✓')
                            : (language === 'ta' ? 'எஸ்க்ரோவில் பாதுகாப்பாக உள்ளது 🔒' : 'Authorized in Escrow 🔒')}
                        </span>
                      </div>
                    </div>

                    {/* Mutual Rating Form upon Completion */}
                    {(order.status === 'DELIVERED' || order.status === 'PAYMENT_RELEASED' || order.status === 'COMPLETED') && (
                      <div className="bg-emerald-50/80 border border-emerald-200 rounded-3xl p-4 sm:p-5 text-xs space-y-3">
                        <div className="flex items-center gap-2 text-emerald-900 font-bold">
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          <span>
                            {language === 'ta' ? 'விவசாயியின் தரம் மற்றும் சேவையை மதிப்பிடவும்' : 'Rate Farm Quality & Service'}
                          </span>
                        </div>
                        <p className="text-slate-600">
                          {language === 'ta'
                            ? 'மதிப்பீடுகள் சிறந்த விவசாயிகளுக்கு நேரடி கொள்முதல் வாய்ப்புகளை உயர்த்துகின்றன.'
                            : 'Mutual ratings ensure accountability across the community direct agricultural marketplace.'}
                        </p>

                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setRatingScore(s)}
                              className="text-lg focus:outline-none"
                            >
                              <Star
                                className={`w-5 h-5 ${
                                  s <= ratingScore ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                                }`}
                              />
                            </button>
                          ))}
                          <span className="font-bold text-slate-700 ml-2">{ratingScore} / 5</span>
                        </div>

                        <input
                          type="text"
                          value={ratingComment}
                          onChange={(e) => setRatingComment(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-200 bg-white outline-none font-medium"
                        />

                        <button
                          type="button"
                          onClick={() => {
                            const farmerUserId = order.items?.[0]?.farmer?.user?.name ? 'cmttx8v3k001' : '';
                            handleRatingSubmit(order.id, farmerUserId);
                          }}
                          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow transition"
                        >
                          {language === 'ta' ? 'மதிப்பீட்டை சமர்ப்பிக்கவும்' : 'Submit Verified Review'}
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
    </div>
  );
};

export default BuyerOrders;
