import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import {
  Package,
  PlusCircle,
  Clock,
  ShieldCheck,
  TrendingUp,
  MapPin,
  ArrowRight,
  Receipt,
  CheckCircle2,
  AlertCircle,
  Sprout,
  DollarSign,
  Truck,
  RefreshCw,
} from 'lucide-react';

interface FarmerDashboardProps {
  onNavigate: (view: string) => void;
  onOpenVoiceModal?: () => void;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({
  onNavigate,
  onOpenVoiceModal,
}) => {
  const { user } = useAuth();
  const { language, t } = useLanguage();

  const [stats, setStats] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [procurements, setProcurements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, subsRes, procRes] = await Promise.all([
        api.getFarmerPortalStats(),
        api.getFarmerSubmissions(),
        api.getFarmerProcurements(),
      ]);

      setStats(statsRes);
      setSubmissions(subsRes || []);
      setProcurements(procRes || []);
    } catch (err) {
      console.error('Failed to load farmer dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const firstName = user?.name?.split(' ')[0] || (language === 'ta' ? 'விவசாயி' : 'Farmer');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header Greeting Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-xs font-bold text-emerald-200 mb-2 border border-white/20 backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>Verified Producer · Salem District</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {language === 'ta' ? `வணக்கம், ${firstName}!` : `Welcome back, ${firstName}!`}
            </h1>
            <p className="text-xs text-emerald-100/90 mt-1 max-w-lg">
              {language === 'ta'
                ? 'உங்கள் விளைபொருட்களை சமர்ப்பிக்கவும். மத்திய சரக்ககம் ஆய்வு செய்து உரிய விலையில் கொள்முதல் செய்யும்.'
                : 'Manage harvest submissions, track Salem Central Hub procurement approvals, and monitor your direct payouts.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('farmer-add-produce')}
              className="px-5 py-3 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs shadow-md transition flex items-center gap-1.5 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Submit Harvest</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Total Submissions
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats?.totalSubmissions || submissions.length || 0}
          </div>
          <div className="text-[10px] text-slate-400">
            {stats?.pendingReview || 0} awaiting review
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Approved & Procured
          </div>
          <div className="text-2xl font-black text-emerald-800">
            {(stats?.approvedSubmissions || 0) + (stats?.purchasedSubmissions || 0)}
          </div>
          <div className="text-[10px] text-emerald-700 font-medium">
            Central Hub Verified
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Produce Procured
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats?.totalQtySold || 350} kg
          </div>
          <div className="text-[10px] text-slate-400">
            In Central Inventory
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Total Payout Received
          </div>
          <div className="text-2xl font-black text-emerald-800">
            ₹{(stats?.totalEarnings || 8750).toLocaleString()}
          </div>
          <div className="text-[10px] text-emerald-700 font-semibold">
            Zero Mandi Deductions
          </div>
        </div>
      </div>

      {/* Recent Submissions Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-base text-slate-900">Recent Produce Submissions</h3>
            <p className="text-xs text-slate-400">Your latest harvests submitted for hub procurement</p>
          </div>
          <button
            onClick={() => onNavigate('farmer-produce')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {submissions.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No produce submitted yet. Click "Submit Harvest" to begin.
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.slice(0, 3).map((sub: any) => (
              <div
                key={sub.id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0">
                    <img
                      src={sub.image || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200'}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{sub.produceName}</div>
                    <div className="text-[11px] text-slate-500">
                      {sub.quantity} {sub.unit} • Expected: ₹{sub.expectedPrice}/{sub.unit} • {sub.farmLocation}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      sub.status === 'PURCHASED'
                        ? 'bg-purple-100 text-purple-800'
                        : sub.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {sub.status}
                  </span>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Value: ₹{(sub.quantity * sub.expectedPrice).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Procurements History */}
      {procurements.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-900">Central Hub Procurement History</h3>
              <p className="text-xs text-slate-400">Direct purchases executed into Ulavar2Ulagam Central Inventory</p>
            </div>
            <button
              onClick={() => onNavigate('farmer-produce')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
            >
              <span>Vouchers</span>
              <Receipt className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {procurements.slice(0, 3).map((p: any) => (
              <div
                key={p.id}
                className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <span>{p.product?.name || 'Produce'}</span>
                    <span className="font-mono text-[10px] text-slate-400">#{p.procurementCode}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Purchased: {p.purchasedQuantity} {p.product?.unit || 'kg'} @ ₹{p.purchasePricePerUnit}/{p.product?.unit || 'kg'}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-extrabold text-sm text-emerald-800">
                    +₹{p.totalCost?.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] font-bold text-emerald-700">PAID TO BANK</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerDashboard;
