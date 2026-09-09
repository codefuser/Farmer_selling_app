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
  const { t } = useLanguage();
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">{t('myOrders')}</h1>
          <p className="text-xs text-slate-500">
            Fulfillment status, quality check records, and delivery tracking
          </p>
        </div>

        <button
          onClick={loadOrders}
          className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 transition"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading orders...</div>
      ) : orderItems.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center text-slate-500 border-slate-200">
          <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <h3 className="font-bold text-slate-800 text-sm">No orders yet</h3>
          <p className="text-xs text-slate-500 mt-1">
            Confirmed orders from commercial buyers will be tracked here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orderItems.map((item) => {
            const order = item.order;
            return (
              <div
                key={item.id}
                className="glass-card rounded-3xl p-6 border-slate-200 hover:border-emerald-300 transition shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                      {order?.orderCode}
                    </span>
                    <h3 className="font-extrabold text-sm text-slate-900 mt-1">
                      {item.batch?.product?.name} ({item.quantity} kg)
                    </h3>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      order?.status === 'COMPLETED' || order?.status === 'DELIVERED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}
                  >
                    {order?.status?.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 text-[10px] block font-semibold">Buyer (வாங்குபவர்)</span>
                    <span className="font-bold text-slate-900 truncate block">
                      {order?.buyer?.businessName}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 text-[10px] block font-semibold">அளவு (Quantity)</span>
                    <span className="font-bold text-slate-900">{item.quantity} kg</span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 text-[10px] block font-semibold">விலை (Price)</span>
                    <span className="font-bold text-slate-900">₹{item.pricePerKg} / kg</span>
                  </div>

                  <div className="bg-emerald-50 p-2.5 rounded-2xl border border-emerald-100">
                    <span className="text-emerald-700 text-[10px] block font-bold">மொத்த மதிப்பு (Total)</span>
                    <span className="font-black text-emerald-900 text-sm">
                      ₹{item.total?.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs flex flex-wrap items-center justify-between gap-2 text-slate-600">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Destination: {order?.deliveryAddress}</span>
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    Created: {new Date(order?.createdAt).toLocaleDateString()}
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
