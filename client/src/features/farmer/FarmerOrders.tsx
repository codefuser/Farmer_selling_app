import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  Building,
  RefreshCw,
  Package,
} from 'lucide-react';

export const FarmerOrders: React.FC = () => {
  const { language, t } = useLanguage();
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await api.getFarmerOrders();
      setOrderItems(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStageLabel = (status: string) => {
    const map: Record<string, { en: string; ta: string }> = {
      ORDERED: { en: 'Order Placed', ta: 'ஆர்டர் செய்யப்பட்டது' },
      ACCEPTED: { en: 'Accepted', ta: 'ஏற்கப்பட்டது' },
      PICKUP_SCHEDULED: { en: 'Pickup Scheduled', ta: 'வாகனம் திட்டமிடப்பட்டது' },
      COLLECTED: { en: 'Collected from Farm', ta: 'பண்ணையில் சேகரிக்கப்பட்டது' },
      QUALITY_CHECKED: { en: 'Quality Verified', ta: 'தரச் சோதனை நிறைவு' },
      PACKED: { en: 'Packed', ta: 'பொதியிடப்பட்டது' },
      DISPATCHED: { en: 'Dispatched', ta: 'வண்டியில் அனுப்பப்பட்டது' },
      DELIVERED: { en: 'Delivered', ta: 'வழங்கப்பட்டது' },
      PAYMENT_RELEASED: { en: 'Payment Released', ta: 'பணம் விடுவிக்கப்பட்டது' },
      COMPLETED: { en: 'Completed', ta: 'முழுமை பெற்றது' },
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
              ? 'விநியோக நிலை, தரச் சரிபார்ப்பு பதிவுகள் மற்றும் நேரடி வாகனக் கண்காணிப்பு'
              : 'Fulfillment status, quality check records, and delivery tracking'}
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
            const cropName =
              language === 'ta'
                ? item.batch?.product?.nameTamil || item.batch?.product?.name
                : item.batch?.product?.name;

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 hover:border-emerald-300 transition shadow-sm space-y-3.5"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                      #{order?.orderCode}
                    </span>
                    <h3 className="font-black text-sm text-slate-900 mt-1">
                      {cropName} ({item.quantity} kg)
                    </h3>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      order?.status === 'COMPLETED' || order?.status === 'DELIVERED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}
                  >
                    {getStageLabel(order?.status)}
                  </span>
                </div>

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
                      {language === 'ta' ? 'மொத்த வருவாய்' : 'Farmer Payout'}
                    </span>
                    <span className="font-black text-emerald-900 text-sm">
                      ₹{item.total?.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FarmerOrders;
