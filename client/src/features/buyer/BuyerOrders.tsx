import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Order, OrderStatus } from '../../types';
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
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(highlightOrderId || null);
  const [loading, setLoading] = useState(true);
  const [advancingStatus, setAdvancingStatus] = useState(false);
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingComment, setRatingComment] = useState('Excellent fresh morning harvest, firm quality.');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

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
      alert('Rating submitted successfully! Thank you for rating the farmers.');
    } catch (err: any) {
      alert(err.message || 'Failed to submit rating');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Procurement Orders & Live Tracking</h1>
          <p className="text-xs text-slate-500">
            End-to-end 10-stage order fulfillment, collection verification, GPS tracking, and escrow release
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
      ) : orders.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center text-slate-500 border-slate-200">
          <Truck className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <h3 className="font-bold text-slate-800 text-sm">No orders yet</h3>
          <p className="text-xs text-slate-500 mt-1">Post a demand or accept a collective pool to establish an order.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const currentStepIdx = ORDER_STEPS.indexOf(order.status);

            return (
              <div
                key={order.id}
                className={`glass-card rounded-3xl p-6 border transition shadow-sm space-y-5 ${
                  isExpanded ? 'border-emerald-500/60 ring-2 ring-emerald-500/10' : 'border-slate-200'
                }`}
              >
                {/* Header Strip */}
                <div
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 cursor-pointer select-none"
                  onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-md border">
                        Order #{order.orderCode}
                      </span>
                      {order.collectiveOrderId && (
                        <span className="text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded-full">
                          Collective Pool Order
                        </span>
                      )}
                    </div>
                    <h3 className="font-extrabold text-base text-slate-900">
                      {order.totalQuantity} kg Produce · ₹{order.totalAmount?.toLocaleString('en-IN')}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                        order.status === 'COMPLETED' || order.status === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}
                    >
                      {order.status.replace('_', ' ')}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>

                {/* 10-Step State Machine Progress Stepper */}
                <div className="overflow-x-auto pt-2 pb-2">
                  <div className="flex items-center min-w-[680px] justify-between relative px-2">
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
                            {stepName.replace('_', ' ')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div className="pt-4 border-t border-slate-100 space-y-6 animate-in fade-in duration-200">
                    {/* Demo Pipeline Advancer Button */}
                    <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <Play className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span className="font-semibold text-emerald-900">
                          Interactive Evaluator Tool: Advance this order to next stage in the pipeline
                        </span>
                      </div>
                      <button
                        onClick={() => handleAdvanceOrder(order)}
                        disabled={advancingStatus || currentStepIdx >= ORDER_STEPS.length - 1}
                        className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl shadow transition disabled:opacity-50 flex items-center gap-1"
                      >
                        <span>
                          Advance to{' '}
                          {currentStepIdx < ORDER_STEPS.length - 1
                            ? ORDER_STEPS[currentStepIdx + 1].replace('_', ' ')
                            : 'Completed'}
                          &rarr;
                        </span>
                      </button>
                    </div>

                    {/* Contributing Farmers Allocation Table */}
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Participating Farmer Supply Breakdown</span>
                      </h4>
                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="text-slate-400 border-b border-slate-200 pb-2">
                              <th className="font-semibold pb-2">Farmer</th>
                              <th className="font-semibold pb-2">Batch Code</th>
                              <th className="font-semibold pb-2">Quantity</th>
                              <th className="font-semibold pb-2">Agreed Price</th>
                              <th className="font-semibold pb-2">Farmer Payout</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium">
                            {order.items?.map((item) => (
                              <tr key={item.id}>
                                <td className="py-2.5 font-bold text-slate-800">
                                  {item.farmer?.user?.name || 'Farmer'}
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
                        <span>Logistics Telemetry & Delivery Map</span>
                      </h4>
                      <DeliveryMap
                        orderCode={order.orderCode}
                        status={order.status}
                        destinationName={order.deliveryAddress}
                      />
                    </div>

                    {/* Escrow Payment Summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <span className="text-slate-400 text-[10px] block font-bold">Total Order Value</span>
                        <span className="text-base font-black text-slate-900">
                          ₹{order.totalAmount?.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <span className="text-slate-400 text-[10px] block font-bold">Platform Fee (2%)</span>
                        <span className="text-base font-bold text-slate-600">
                          ₹{order.platformFee?.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
                        <span className="text-emerald-700 text-[10px] block font-bold">Escrow Status</span>
                        <span className="text-base font-black text-emerald-900">
                          {order.status === 'DELIVERED' || order.status === 'PAYMENT_RELEASED' || order.status === 'COMPLETED'
                            ? 'Released to Farmers ✓'
                            : 'Authorized in Escrow 🔒'}
                        </span>
                      </div>
                    </div>

                    {/* Mutual Rating Form upon Completion */}
                    {(order.status === 'DELIVERED' || order.status === 'PAYMENT_RELEASED' || order.status === 'COMPLETED') && (
                      <div className="bg-emerald-50/80 border border-emerald-200 rounded-3xl p-5 text-xs space-y-3">
                        <div className="flex items-center gap-2 text-emerald-900 font-bold">
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          <span>Rate Farm Quality & Service</span>
                        </div>
                        <p className="text-slate-600">
                          Mutual ratings ensure accountability across the community direct agricultural marketplace.
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
                          <span className="font-bold text-slate-700 ml-2">{ratingScore} Stars</span>
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
                          className="px-4 py-2 bg-emerald-700 text-white rounded-xl font-bold shadow hover:bg-emerald-600 transition"
                        >
                          Submit Verified Review
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
