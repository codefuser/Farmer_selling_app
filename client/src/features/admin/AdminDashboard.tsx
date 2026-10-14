import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import {
  Package,
  Truck,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Search,
  Scale,
  Sparkles,
  ShoppingBag,
  Sprout,
  ShieldCheck,
  Receipt,
  Users,
  Edit2,
  Plus,
  ArrowRight,
  Clock,
  KeyRound,
  Filter,
  DollarSign,
  Boxes,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { language } = useLanguage();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'submissions' | 'inventory' | 'orders' | 'procurements' | 'fleet'
  >('overview');

  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [procurements, setProcurements] = useState<any[]>([]);
  const [deliveryPartners, setDeliveryPartners] = useState<any[]>([]);

  // Review / Procure Modal State
  const [selectedSubForReview, setSelectedSubForReview] = useState<any | null>(null);
  const [reviewStatus, setReviewStatus] = useState<string>('APPROVED');
  const [adminNotes, setAdminNotes] = useState<string>('Quality inspected at Salem Hub. Grade A standard.');
  const [rejectionReason, setRejectionReason] = useState<string>('');

  // Procure Intake Modal State
  const [selectedSubForProcure, setSelectedSubForProcure] = useState<any | null>(null);
  const [procureQty, setProcureQty] = useState<string>('100');
  const [procurePrice, setProcurePrice] = useState<string>('22');
  const [procureSellingPrice, setProcureSellingPrice] = useState<string>('32');
  const [procureGrade, setProcureGrade] = useState<string>('Grade A');
  const [isProcuring, setIsProcuring] = useState(false);

  // Stock Edit Modal State
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [editSellingPrice, setEditSellingPrice] = useState<string>('');
  const [editThreshold, setEditThreshold] = useState<string>('');
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  // Delivery Assign Modal State
  const [selectedOrderForDelivery, setSelectedOrderForDelivery] = useState<any | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [deliveryNotes, setDeliveryNotes] = useState<string>('Deliver directly to customer doorstep.');
  const [isAssigningDelivery, setIsAssigningDelivery] = useState(false);

  // Status Change State for Orders
  const [isUpdatingOrder, setIsUpdatingOrder] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [mRes, sRes, iRes, oRes, pRes, dRes] = await Promise.all([
        api.getAdminMetrics().catch(() => null),
        api.getAdminSubmissions().catch(() => []),
        api.getAdminInventory().catch(() => []),
        api.getCustomerOrdersAdmin().catch(() => []),
        api.getAdminProcurements().catch(() => []),
        api.getDeliveryPartners().catch(() => []),
      ]);

      setMetrics(mRes);
      setSubmissions(sRes || []);
      setInventory(iRes || []);
      setOrders(oRes || []);
      setProcurements(pRes || []);
      setDeliveryPartners(dRes || []);
      if (dRes && dRes.length > 0 && !selectedDriverId) {
        setSelectedDriverId(dRes[0].id);
      }
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Review submission
  const handleReviewSubmissionSubmit = async () => {
    if (!selectedSubForReview) return;
    try {
      await api.reviewAdminSubmission(
        selectedSubForReview.id,
        reviewStatus,
        adminNotes,
        rejectionReason
      );
      showToast(`Submission #${selectedSubForReview.code} marked as ${reviewStatus}`);
      setSelectedSubForReview(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Review failed');
    }
  };

  // Execute procurement into central inventory
  const handleExecuteProcurement = async () => {
    if (!selectedSubForProcure) return;
    try {
      setIsProcuring(true);
      const res = await api.recordProcurement({
        submissionId: selectedSubForProcure.id,
        purchasedQuantity: parseFloat(procureQty),
        purchasePricePerUnit: parseFloat(procurePrice),
        sellingPrice: parseFloat(procureSellingPrice),
        qualityGrade: procureGrade,
        notes: `Procured from farmer ${selectedSubForProcure.farmer?.user?.name || 'Kumar'}. Added to Central Inventory.`,
      });

      showToast(`Successfully intaken ${procureQty} ${selectedSubForProcure.unit} into Central Inventory!`);
      setSelectedSubForProcure(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Procurement failed');
    } finally {
      setIsProcuring(false);
    }
  };

  // Save product inventory update
  const handleSaveProduct = async () => {
    if (!editingProduct) return;
    try {
      setIsSavingProduct(true);
      await api.updateAdminInventory(editingProduct.id, {
        sellingPrice: parseFloat(editSellingPrice),
        lowStockThreshold: parseFloat(editThreshold),
      });
      showToast(`Updated pricing for ${editingProduct.name}`);
      setEditingProduct(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Update failed');
    } finally {
      setIsSavingProduct(false);
    }
  };

  // Order status update
  const handleUpdateOrderStatus = async (orderId: string, nextStatus: string) => {
    try {
      setIsUpdatingOrder(orderId);
      await api.updateOrderStatusAdmin(orderId, nextStatus);
      showToast(`Order status updated to ${nextStatus}`);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    } finally {
      setIsUpdatingOrder(null);
    }
  };

  // Assign delivery partner
  const handleAssignDeliverySubmit = async () => {
    if (!selectedOrderForDelivery || !selectedDriverId) return;
    try {
      setIsAssigningDelivery(true);
      const res = await api.assignDeliveryPartner(
        selectedOrderForDelivery.id,
        selectedDriverId,
        deliveryNotes
      );
      showToast(`Assigned Delivery Partner to order #${selectedOrderForDelivery.orderCode}`);
      setSelectedOrderForDelivery(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to assign driver');
    } finally {
      setIsAssigningDelivery(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl border border-emerald-500/40 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Admin Operations Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ulavar2Ulagam Central Operations & Procurement Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Central Hub Administration Console
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Review farmer submissions, intake produce into Central Inventory, set retail prices, fulfill customer orders, and dispatch delivery fleet.
          </p>
        </div>

        <button
          onClick={loadData}
          className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl text-slate-200 transition border border-white/10 shrink-0"
          title="Refresh Hub Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs font-bold">
        {[
          { id: 'overview', label: 'Operations KPIs', icon: TrendingUp },
          { id: 'submissions', label: `Farmer Submissions (${submissions.length})`, icon: Sprout },
          { id: 'inventory', label: `Central Inventory (${inventory.length})`, icon: Boxes },
          { id: 'orders', label: `Customer Orders (${orders.length})`, icon: ShoppingBag },
          { id: 'procurements', label: `Procurement Ledger (${procurements.length})`, icon: Receipt },
          { id: 'fleet', label: `Delivery Fleet (${deliveryPartners.length})`, icon: Truck },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-2.5 rounded-2xl flex items-center gap-1.5 whitespace-nowrap transition ${
                isActive
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5 text-emerald-500" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading Central Hub data...</p>
        </div>
      ) : activeTab === 'overview' ? (
        /* 1. OPERATIONS KPIS */
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Farmer Submissions
              </div>
              <div className="text-2xl font-black text-slate-900">
                {metrics?.submissions?.total || submissions.length}
              </div>
              <div className="text-[10px] text-amber-700 font-bold">
                {metrics?.submissions?.pending || 0} Pending Review
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Central Inventory Stock
              </div>
              <div className="text-2xl font-black text-emerald-800">
                {metrics?.inventory?.totalStockKg || 800} kg
              </div>
              <div className="text-[10px] text-slate-400">
                {metrics?.inventory?.totalProducts || inventory.length} active listed products
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Customer Orders
              </div>
              <div className="text-2xl font-black text-slate-900">
                {metrics?.orders?.total || orders.length}
              </div>
              <div className="text-[10px] text-indigo-700 font-bold">
                {metrics?.orders?.pendingFulfillment || 0} Need Packaging / Dispatch
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Procurement Spend
              </div>
              <div className="text-2xl font-black text-emerald-800">
                ₹{(metrics?.financials?.totalProcurementSpend || 12500).toLocaleString()}
              </div>
              <div className="text-[10px] text-emerald-700 font-medium">
                Sales: ₹{(metrics?.financials?.totalSalesRevenue || 18400).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Quick Action Hub */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Sprout className="w-4 h-4 text-emerald-600" />
                  <span>Pending Produce Submissions ({submissions.filter((s) => s.status === 'SUBMITTED' || s.status === 'UNDER_REVIEW').length})</span>
                </h3>
                <button
                  onClick={() => setActiveTab('submissions')}
                  className="text-xs text-emerald-700 font-bold hover:underline"
                >
                  Manage All →
                </button>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {submissions.slice(0, 3).map((sub) => (
                  <div key={sub.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">{sub.produceName}</div>
                      <div className="text-[11px] text-slate-500">
                        Farmer: {sub.farmer?.user?.name || 'Kumar'} • {sub.quantity} {sub.unit} @ ₹{sub.expectedPrice}/{sub.unit}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedSubForProcure(sub);
                        setProcureQty(String(sub.quantity));
                        setProcurePrice(String(sub.expectedPrice));
                        setProcureSellingPrice(String(Math.round(sub.expectedPrice * 1.35)));
                      }}
                      className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg border border-emerald-200"
                    >
                      Procure
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-indigo-600" />
                  <span>Live Customer Orders ({orders.length})</span>
                </h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs text-indigo-700 font-bold hover:underline"
                >
                  View All Orders →
                </button>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {orders.slice(0, 3).map((ord) => (
                  <div key={ord.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">
                        #{ord.orderCode} · {ord.customerName || ord.buyer?.user?.name || 'Customer'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {ord.totalQuantity} kg • ₹{ord.totalAmount} • Status:{' '}
                        <span className="font-bold text-emerald-700">{ord.status}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedOrderForDelivery(ord);
                      }}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg"
                    >
                      Dispatch
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'submissions' ? (
        /* 2. FARMER SUBMISSIONS TAB */
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-black text-slate-900">Farmer Produce Submissions</h2>
              <p className="text-xs text-slate-400">Review crop submissions and execute direct procurement into Central Inventory</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-3">Produce & Farmer</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Quantity</th>
                  <th className="py-3 px-3">Expected Rate</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={sub.image || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200'}
                          alt=""
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{sub.produceName}</div>
                          <div className="text-[11px] text-slate-500">
                            {sub.farmer?.user?.name || 'Farmer'} · {sub.farmLocation || 'Salem'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
                        {sub.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 font-semibold text-slate-900">
                      {sub.quantity} {sub.unit}
                    </td>

                    <td className="py-3.5 px-3 font-extrabold text-emerald-800">
                      ₹{sub.expectedPrice} / {sub.unit}
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          sub.status === 'PURCHASED'
                            ? 'bg-purple-100 text-purple-800'
                            : sub.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : sub.status === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-right space-x-2">
                      <button
                        onClick={() => setSelectedSubForReview(sub)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold transition"
                      >
                        Review
                      </button>

                      {sub.status !== 'PURCHASED' && (
                        <button
                          onClick={() => {
                            setSelectedSubForProcure(sub);
                            setProcureQty(String(sub.quantity));
                            setProcurePrice(String(sub.expectedPrice));
                            setProcureSellingPrice(String(Math.round(sub.expectedPrice * 1.35)));
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition shadow-sm"
                        >
                          Procure to Hub
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'inventory' ? (
        /* 3. CENTRAL INVENTORY MANAGEMENT TAB */
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-black text-slate-900">Central Inventory Products</h2>
              <p className="text-xs text-slate-400">Live products listed on customer storefront with central stock and retail pricing</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-3">Product</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Central Stock</th>
                  <th className="py-3 px-3">Procurement Cost</th>
                  <th className="py-3 px-3">Selling Price</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {inventory.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.images?.[0] || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200'}
                          alt=""
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{prod.name}</div>
                          <div className="text-[11px] text-slate-500">{prod.nameTamil || 'Salem Hub'}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-600">{prod.category}</span>
                    </td>

                    <td className="py-3 px-3 font-extrabold text-slate-900">
                      {prod.stockQuantity} {prod.unit}
                    </td>

                    <td className="py-3 px-3 text-slate-500">
                      ₹{prod.avgProcurementCost || 0} / {prod.unit}
                    </td>

                    <td className="py-3 px-3 font-bold text-emerald-800 text-sm">
                      ₹{prod.sellingPrice} / {prod.unit}
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          prod.stockQuantity <= 0
                            ? 'bg-rose-100 text-rose-800'
                            : prod.stockQuantity <= (prod.lowStockThreshold || 10)
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {prod.stockQuantity <= 0 ? 'OUT OF STOCK' : prod.status}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => {
                          setEditingProduct(prod);
                          setEditSellingPrice(String(prod.sellingPrice));
                          setEditThreshold(String(prod.lowStockThreshold || 10));
                        }}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-800 font-bold transition flex items-center gap-1 ml-auto"
                      >
                        <Edit2 className="w-3 h-3 text-slate-500" />
                        <span>Edit Price</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'orders' ? (
        /* 4. CUSTOMER ORDERS TAB */
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-black text-slate-900">Customer Orders & Dispatch</h2>
              <p className="text-xs text-slate-400">Advance order fulfillment stage and assign company delivery partners</p>
            </div>
          </div>

          <div className="space-y-4">
            {orders.map((ord) => (
              <div
                key={ord.id}
                className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200/90 space-y-3"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      #{ord.orderCode}
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      {ord.customerName || ord.buyer?.user?.name || 'Customer'} ({ord.customerPhone || '9876543210'})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-emerald-800">
                      ₹{ord.totalAmount}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-white uppercase">
                      {ord.status}
                    </span>
                  </div>
                </div>

                {/* Items & Address */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="font-bold text-slate-700 mb-1">Purchased Items:</div>
                    <ul className="space-y-1 text-slate-600">
                      {ord.items?.map((it: any) => (
                        <li key={it.id}>
                          • {it.productName || it.product?.name} — {it.quantity} {it.unit || 'kg'} (₹{it.total})
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div className="font-bold text-slate-700 mb-1">Delivery Info:</div>
                    <p className="text-slate-600">{ord.deliveryAddress}</p>
                    {ord.deliveryAssignment && (
                      <div className="mt-1 text-emerald-800 font-semibold flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5" />
                        <span>Driver: {ord.deliveryAssignment.driver?.name} (OTP: {ord.deliveryAssignment.confirmationOtp})</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Advancement & Assign Driver Buttons */}
                <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-medium">Update Status:</span>
                    {['PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED', 'DISPATCHED', 'DELIVERED'].map((st) => (
                      <button
                        key={st}
                        onClick={() => handleUpdateOrderStatus(ord.id, st)}
                        disabled={ord.status === st || isUpdatingOrder === ord.id}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                          ord.status === st
                            ? 'bg-slate-900 text-white'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setSelectedOrderForDelivery(ord)}
                    className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-sm transition flex items-center gap-1"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Assign Delivery Partner</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === 'procurements' ? (
        /* 5. PROCUREMENT LEDGER TAB */
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-black text-slate-900">Central Hub Procurement Ledger</h2>
              <p className="text-xs text-slate-400">All produce purchases executed from farmers into Central Inventory</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-3">Voucher Code</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Farmer</th>
                  <th className="py-3 px-3">Product</th>
                  <th className="py-3 px-3">Purchased Qty</th>
                  <th className="py-3 px-3">Unit Price</th>
                  <th className="py-3 px-3 text-right">Total Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {procurements.map((proc) => (
                  <tr key={proc.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3 font-mono font-bold text-slate-800">
                      #{proc.procurementCode}
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {new Date(proc.procurementDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {proc.farmer?.user?.name || 'Kumar Govindasamy'}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      {proc.product?.name || 'Produce'}
                    </td>
                    <td className="py-3 px-3 font-extrabold text-slate-900">
                      {proc.purchasedQuantity} {proc.product?.unit || 'kg'}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      ₹{proc.purchasePricePerUnit} / {proc.product?.unit || 'kg'}
                    </td>
                    <td className="py-3 px-3 text-right font-black text-emerald-800 text-sm">
                      ₹{proc.totalCost?.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* 6. DELIVERY FLEET TAB */
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-black text-slate-900">Ulavar2Ulagam Delivery Fleet</h2>
              <p className="text-xs text-slate-400">Dedicated delivery partners stationed across Salem Hub</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {deliveryPartners.map((dp) => (
              <div
                key={dp.id}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{dp.name}</h4>
                    <p className="text-xs text-slate-500">{dp.mobile || '+91 98765 43213'}</p>
                  </div>
                </div>

                <div className="text-xs space-y-1 text-slate-600 border-t border-slate-200/80 pt-2">
                  <div>Assigned Hub: <strong>Salem VOC Central Hub</strong></div>
                  <div>Status: <span className="text-emerald-700 font-bold">Active On-Duty</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review Submission Modal */}
      {selectedSubForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <h3 className="font-black text-base text-slate-900">
              Review Submission #{selectedSubForReview.code}
            </h3>
            <p className="text-slate-500">
              {selectedSubForReview.produceName} from {selectedSubForReview.farmer?.user?.name || 'Farmer'} ({selectedSubForReview.quantity} {selectedSubForReview.unit})
            </p>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Review Decision</label>
              <select
                value={reviewStatus}
                onChange={(e) => setReviewStatus(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold"
              >
                <option value="APPROVED">APPROVED (Ready for Hub Procurement)</option>
                <option value="UNDER_REVIEW">UNDER QC REVIEW</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">QC Inspector Notes</label>
              <textarea
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
              />
            </div>

            {reviewStatus === 'REJECTED' && (
              <div className="space-y-1.5">
                <label className="font-bold text-rose-700">Rejection Reason</label>
                <input
                  type="text"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Moisture level exceeded / pest damage"
                  className="w-full p-2.5 rounded-xl border border-rose-200 bg-rose-50"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedSubForReview(null)}
                className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleReviewSubmissionSubmit}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl"
              >
                Save Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Procure to Central Inventory Modal */}
      {selectedSubForProcure && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                DIRECT INTAKE
              </span>
              <h3 className="font-black text-base text-slate-900 mt-1.5">
                Procure to Central Inventory
              </h3>
              <p className="text-slate-500 mt-0.5">
                Buying {selectedSubForProcure.produceName} from {selectedSubForProcure.farmer?.user?.name || 'Farmer'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Purchased Qty ({selectedSubForProcure.unit})</label>
                <input
                  type="number"
                  value={procureQty}
                  onChange={(e) => setProcureQty(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Procure Rate (₹/{selectedSubForProcure.unit})</label>
                <input
                  type="number"
                  value={procurePrice}
                  onChange={(e) => setProcurePrice(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-emerald-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Retail Selling Price (₹/{selectedSubForProcure.unit})</label>
                <input
                  type="number"
                  value={procureSellingPrice}
                  onChange={(e) => setProcureSellingPrice(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Quality Grade</label>
                <select
                  value={procureGrade}
                  onChange={(e) => setProcureGrade(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                >
                  <option value="Grade A">Grade A (Premium)</option>
                  <option value="Grade B">Grade B (Standard)</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center font-bold text-emerald-900">
              <span>Total Payout to Farmer:</span>
              <span className="text-sm">
                ₹{(parseFloat(procureQty || '0') * parseFloat(procurePrice || '0')).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedSubForProcure(null)}
                className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteProcurement}
                disabled={isProcuring}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-sm transition"
              >
                {isProcuring ? 'Intaking Stock...' : 'Execute Intake'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Inventory Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <h3 className="font-black text-base text-slate-900">
              Edit Price: {editingProduct.name}
            </h3>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Retail Selling Price (₹/{editingProduct.unit})</label>
              <input
                type="number"
                value={editSellingPrice}
                onChange={(e) => setEditSellingPrice(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-emerald-800"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Low Stock Alert Threshold ({editingProduct.unit})</label>
              <input
                type="number"
                value={editThreshold}
                onChange={(e) => setEditThreshold(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProduct}
                disabled={isSavingProduct}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl"
              >
                {isSavingProduct ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Delivery Partner Modal */}
      {selectedOrderForDelivery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                DISPATCH ORDER
              </span>
              <h3 className="font-black text-base text-slate-900 mt-1">
                Assign Delivery Partner to #{selectedOrderForDelivery.orderCode}
              </h3>
              <p className="text-slate-500 mt-0.5">
                Delivery to: {selectedOrderForDelivery.deliveryAddress}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Select Delivery Driver</label>
              <select
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold"
              >
                {deliveryPartners.map((dp) => (
                  <option key={dp.id} value={dp.id}>
                    {dp.name} ({dp.mobile || '+91 98765 43213'})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Dispatch Notes / Instructions</label>
              <textarea
                rows={2}
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
              />
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-800 leading-relaxed">
              <strong>Security Protocol:</strong> An encrypted 4-digit OTP will be automatically generated and shared with the customer. The partner must verify this OTP upon delivery.
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedOrderForDelivery(null)}
                className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignDeliverySubmit}
                disabled={isAssigningDelivery}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-sm transition"
              >
                {isAssigningDelivery ? 'Assigning...' : 'Confirm Dispatch'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
