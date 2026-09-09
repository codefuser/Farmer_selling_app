import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  FileText,
  Store,
  Truck,
  CheckCircle2,
  TrendingUp,
  PlusCircle,
  Clock,
  MapPin,
  ChevronRight,
  Layers,
  Sparkles,
} from 'lucide-react';

interface BuyerDashboardProps {
  onNavigate: (view: string, params?: any) => void;
}

export const BuyerDashboard: React.FC<BuyerDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.getBuyerDashboard();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const buyer = data?.buyer;
  const stats = data?.stats;
  const recentDemands = data?.recentDemands || [];
  const activeOrders = data?.activeOrders || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Buyer Hero Header */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border-slate-200 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-semibold text-emerald-300 mb-2">
              <span>Verified Commercial Buyer · {buyer?.businessType || 'HOTEL'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {buyer?.businessName || 'ABC Grand Heritage Hotel'}
            </h1>
            <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>{buyer?.address || 'Omalur Main Road, Fairlands, Salem'}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('buyer-post-demand')}
              className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg transition flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Bulk Requirement</span>
            </button>
            <button
              onClick={() => onNavigate('buyer-marketplace')}
              className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 backdrop-blur-md transition flex items-center gap-1.5"
            >
              <Store className="w-4 h-4 text-emerald-300" />
              <span>Marketplace</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Active Demands</span>
            <FileText className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats?.activeDemandsCount || 1}</div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">
            Matching nearby farmers
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Active Orders</span>
            <Truck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats?.activeOrdersCount || 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">In transit / QC</div>
        </div>

        <div className="glass-card rounded-2xl p-5 border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Total Orders</span>
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats?.totalOrdersCount || 1}</div>
          <div className="text-[11px] text-slate-500 mt-1">Completed shipments</div>
        </div>

        <div className="glass-card rounded-2xl p-5 border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Total Sourced Value</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">
            ₹{stats?.totalSpent?.toLocaleString('en-IN') || '9,200'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">~18% saved vs brokers</div>
        </div>
      </div>

      {/* Active Demands Section with Smart Matches link */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Active Procurement Demands</h2>
            <p className="text-xs text-slate-500">Live requirements awaiting or matched with nearby farmer clusters</p>
          </div>
          <button
            onClick={() => onNavigate('buyer-post-demand')}
            className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
          >
            <span>+ New Demand</span>
          </button>
        </div>

        {recentDemands.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center text-slate-400 text-xs">
            No active demands posted yet. Click "Post Bulk Requirement" to start.
          </div>
        ) : (
          <div className="space-y-3">
            {recentDemands.map((demand: any) => (
              <div
                key={demand.id}
                className="glass-card rounded-3xl p-5 border-slate-200 hover:border-emerald-300 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md border">
                      {demand.demandCode}
                    </span>
                    <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      Status: {demand.status}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-slate-900 mt-1">
                    {demand.product?.name} · {demand.requiredQuantity} kg
                  </h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Budget: ₹{demand.minBudget} - ₹{demand.maxBudget}/kg · Grade {demand.requiredGrade} · Max Distance: {demand.maxDistanceKm}km
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onNavigate('buyer-smart-matches', { demandId: demand.id })}
                    className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-xs shadow-md transition flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                    <span>View Smart Matches & Collective Supply &rarr;</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerDashboard;
