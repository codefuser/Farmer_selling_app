import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useRealtime } from '../../context/RealtimeContext';
import api from '../../services/api';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  Building,
  RefreshCw,
  Package,
  Check,
  XCircle,
  AlertCircle,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';

export const FarmerOrders: React.FC = () => {
  const { language, t } = useLanguage();
  const { subscribe } = useRealtime();

  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Rejection modal
  const [rejectItem, setRejectItem] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState('Crop harvest delayed / damaged');

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await api.getFarmerOrders();
      setOrderItems(res);
    } catch (err) {
      console.error('Failed to load farmer orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Realtime push subscription
  useEffect(() => {
    const unsubscribe = subscribe('order_status_update', () => {
      loadOrders();
    });
    return () => unsubscribe();
  }, [subscribe]);

  const handleAcceptOrder = async (orderId: string) => {
    setActionLoading(orderId);
    try {
      await api.acceptOrder(orderId);
      await loadOrders();
    } catch (err: any) {
      alert(err.message || 'Failed to accept order');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectOrder = async () => {
    if (!rejectItem) return;
    const orderId = rejectItem.order.id;
    setActionLoading(orderId);
    try {
      await api.rejectOrder(orderId, rejectReason);
      setRejectItem(null);
      await loadOrders();
    } catch (err: any) {
      alert(err.message || 'Failed to reject order');
    } finally {
      setActionLoading(null);
    }
  };

  const getStageLabel = (status: string) => {
    const map: Record<string, { en: string; ta: string }> = {
      ORDERED: { en: 'Order Placed (Action Required)', ta: 'புதிய ஆர்டர் (உறுதி செய்க)' },
      ACCEPTED: { en: 'Accepted', ta: 'ஏற்கப்பட்டது' },
      PICKUP_SCHEDULED: { en: 'Pickup Scheduled', ta: 'வாகனம் திட்டமிடப்பட்டது' },
      COLLECTED: { en: 'Collected from Farm', ta: 'பண்ணையில் சேகரிக்கப்பட்டது' },
      QUALITY_CHECKED: { en: 'Quality Verified', ta: 'தரச் சோதனை நிறைவு' },
      PACKED: { en: 'Packed', ta: 'பொதியிடப்பட்டது' },
      DISPATCHED: { en: 'Dispatched', ta: 'வண்டியில் அனுப்பப்பட்டது' },
      DELIVERED: { en: 'Delivered', ta: 'வழங்கப்பட்டது' },
      PAYMENT_RELEASED: { en: 'Payment Released', ta: 'பணம் விடுவிக்கப்பட்டது' },
      COMPLETED: { en: 'Completed', ta: 'முழுமை பெற்றது' },
      CANCELLED: { en: 'Cancelled', ta: 'ரத்து செய்யப்பட்டது' },
    };
    return language === 'ta' ? map[status]?.ta || status : map[status]?.en || status;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">{t('myOrders')}</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'ta'
              ? 'நேரடி வாங்குபவர் ஆர்டர்களை உறுதி செய்தல், எஸ்க்ரோ பரிவர்த்தனை மற்றும் கண்காணிப்பு'
              : 'Direct buyer order confirmation, escrow settlements, and logistics pickup'}
          </p>
        </div>

        <button
          onClick={loadOrders}
          className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 transition"
          title="Refresh"
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
      ) : orderItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center text-slate-500 border border-slate-200 max-w-md mx-auto space-y-3">
          <ShoppingBag className="w-12 h-12 mx-auto text-slate-300" />
          <h3 className="font-extrabold text-slate-800 text-sm">
            {language === 'ta' ? 'ஆர்டர்கள் ஏதுமில்லை' : 'No orders yet'}
          </h3>
          <p className="text-xs text-slate-500">
            {language === 'ta'
              ? 'வணிகர்கள் அல்லது நுகர்வோர் உங்கள் விளைபொருட்களை வாங்கும் போது இங்கு தோன்றும்.'
              : 'Confirmed orders from commercial buyers or direct consumers will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orderItems.map((item) => {
            const order = item.order;
            const isPendingAction = order?.status === 'ORDERED';
            const isCancelled = order?.status === 'CANCELLED';
            const cropName =
              language === 'ta'
                ? item.batch?.product?.nameTamil || item.batch?.product?.name
                : item.batch?.product?.name;

            const netPayout = Math.round(item.total * 0.98);

            return (
              <div
                key={item.id}
                className={`bg-white rounded-3xl p-4 sm:p-6 border transition shadow-sm space-y-3.5 ${
                  isPendingAction
                    ? 'border-amber-400 ring-2 ring-amber-400/20 bg-amber-50/10'
                    : isCancelled
                    ? 'border-rose-200 bg-rose-50/10'
                    : 'border-slate-200 hover:border-emerald-300'
                }`}
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                        #{order?.orderCode}
                      </span>
                      {order?.deliveryMethod && (
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                          {order.deliveryMethod}
                        </span>
                      )}
                    </div>
                    <h3 className="font-black text-sm text-slate-900 mt-1">
                      {cropName} ({item.quantity} kg)
                    </h3>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      isPendingAction
                        ? 'bg-amber-100 text-amber-800 animate-pulse'
                        : isCancelled
                        ? 'bg-rose-100 text-rose-800'
                        : order?.status === 'COMPLETED' || order?.status === 'DELIVERED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}
                  >
                    {getStageLabel(order?.status)}
                  </span>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 text-[10px] block font-semibold">
                      {language === 'ta' ? 'வாங்குபவர்' : 'Buyer'}
                    </span>
                    <span className="font-bold text-slate-900 truncate block">
                      {order?.buyer?.businessName || (language === 'ta' ? 'நேரடி நுகர்வோர்' : 'Direct Buyer')}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 text-[10px] block font-semibold">
                      {language === 'ta' ? 'அளவு' : 'Quantity'}
                    </span>
                    <span className="font-bold text-slate-900">{item.quantity} kg</span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 text-[10px] block font-semibold">
                      {language === 'ta' ? 'விலை / கிலோ' : 'Price / kg'}
                    </span>
                    <span className="font-bold text-slate-900">₹{item.pricePerKg} / kg</span>
                  </div>

                  <div className="bg-emerald-50 p-2.5 rounded-2xl border border-emerald-100">
                    <span className="text-emerald-700 text-[10px] block font-bold">
                      {language === 'ta' ? 'நிகர விவசாயி வருவாய் (98%)' : 'Net Farmer Payout (98%)'}
                    </span>
                    <span className="font-black text-emerald-900 text-sm">
                      ₹{netPayout.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Destination and Timeline */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs flex flex-wrap items-center justify-between gap-2 text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>
                      {language === 'ta' ? 'டெலிவரி இடம்:' : 'Destination:'} {order?.deliveryAddress}
                    </span>
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    {language === 'ta' ? 'தேதி:' : 'Date:'}{' '}
                    {new Date(order?.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Phase 2: Accept / Reject Buttons for Pending Orders */}
                {isPendingAction && (
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="text-[11px] text-amber-800 font-semibold flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span>{language === 'ta' ? 'வாங்குபவர் காத்திருக்கிறார். தயவுசெய்து ஆர்டரை உறுதி செய்யவும்.' : 'New buyer order awaiting your confirmation.'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setRejectItem(item)}
                        disabled={actionLoading === order.id}
                        className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition active:scale-95"
                      >
                        {language === 'ta' ? 'நிராகரி' : 'Reject'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAcceptOrder(order.id)}
                        disabled={actionLoading === order.id}
                        className="px-4 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5 active:scale-95"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{language === 'ta' ? 'ஆர்டரை ஏற்றுக்கொள்' : 'Accept Order'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-600" />
              <span>{language === 'ta' ? 'ஆர்டரை நிராகரித்தல்' : 'Reject Order'} #{rejectItem.order.orderCode}</span>
            </h3>

            <p className="text-xs text-slate-600">
              {language === 'ta'
                ? 'ஆர்டரை நிராகரித்தால் வாங்குபவரின் பணம் உடனடியாக திருப்பித் தரப்படும்.'
                : 'Rejecting this order will restore batch inventory and refund the buyer immediately.'}
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                {language === 'ta' ? 'நிராகரிப்பதற்கான காரணம்' : 'Reason for Rejection'}
              </label>
              <select
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-slate-50 focus:bg-white outline-none"
              >
                <option value="Crop harvest delayed / weather issue">Crop harvest delayed / weather issue</option>
                <option value="Batch already committed locally">Batch already committed locally</option>
                <option value="Quality below standard for shipping">Quality below standard for shipping</option>
                <option value="Farm logistics unavailable">Farm logistics unavailable</option>
                <option value="Other reason">Other reason</option>
              </select>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setRejectItem(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
              >
                {language === 'ta' ? 'பின்செல்' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={actionLoading === rejectItem.order.id}
                onClick={handleRejectOrder}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow transition disabled:opacity-50"
              >
                {language === 'ta' ? 'உறுதி செய் & நிராகரி' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerOrders;
