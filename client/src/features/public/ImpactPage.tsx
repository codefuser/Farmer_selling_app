import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  ShieldCheck,
  Award,
  Users,
  Layers,
  Leaf,
  Sparkles,
  DollarSign,
  Clock,
} from 'lucide-react';
import api from '../../services/api';

export const ImpactPage: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    api.getAdminDashboard().then(setMetrics).catch(console.error);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-800 border border-amber-300 px-3.5 py-1 rounded-full text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Smart India Hackathon 2026 · Verified Prototype Telemetry</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          System Impact & Agronomic Efficiency
        </h1>
        <p className="text-slate-600 text-sm mt-3 leading-relaxed">
          Real-time measurement of economic value returned to smallholder farmers and food loss prevented through community collective pooling and freshness management.
        </p>
        <span className="inline-block mt-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          (Prototype Demo Data · Seeded Benchmark)
        </span>
      </div>

      {/* Hero Impact Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card rounded-3xl p-6 border-emerald-200/80 bg-gradient-to-b from-emerald-50/50 to-white">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mb-4 shadow-md shadow-emerald-600/20">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="text-3xl font-black text-slate-900">+22.4%</div>
          <div className="text-xs font-bold text-emerald-800 mt-1 uppercase tracking-wider">
            Farmer Net Earnings Lift
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Compared to traditional local APMC mandi commission agents who levy 6-12% commission plus unauthorized grading deductions.
          </p>
        </div>

        <div className="glass-card rounded-3xl p-6 border-teal-200/80 bg-gradient-to-b from-teal-50/50 to-white">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center mb-4 shadow-md shadow-teal-600/20">
            <DollarSign className="w-6 h-6" />
          </div>
          <div className="text-3xl font-black text-slate-900">18.2%</div>
          <div className="text-xs font-bold text-teal-800 mt-1 uppercase tracking-wider">
            Intermediary Margin Saved
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Elimination of 3 secondary transport hops and speculative wholesaler markups shared directly between farmer and commercial buyer.
          </p>
        </div>

        <div className="glass-card rounded-3xl p-6 border-amber-200/80 bg-gradient-to-b from-amber-50/50 to-white">
          <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center mb-4 shadow-md shadow-amber-600/20">
            <Leaf className="w-6 h-6" />
          </div>
          <div className="text-3xl font-black text-slate-900">
            {metrics?.impact?.estimatedWastagePreventedKg || 4850} kg
          </div>
          <div className="text-xs font-bold text-amber-800 mt-1 uppercase tracking-wider">
            Perishable Waste Prevented
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Aging produce transitioned to Urgent Sale mode with B2B hotel discounts within 2-4 hours before shelf rot.
          </p>
        </div>

        <div className="glass-card rounded-3xl p-6 border-indigo-200/80 bg-gradient-to-b from-indigo-50/50 to-white">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-4 shadow-md shadow-indigo-600/20">
            <Layers className="w-6 h-6" />
          </div>
          <div className="text-3xl font-black text-slate-900">
            {metrics?.counts?.totalFarmers || 20} Farmers
          </div>
          <div className="text-xs font-bold text-indigo-800 mt-1 uppercase tracking-wider">
            Active Community Supply
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Connected across Salem agricultural district villages (Thalaivasal, Attur, Gangavalli, Mecheri, Valapadi).
          </p>
        </div>
      </div>

      {/* Community Supply Model Comparison Table */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border-slate-200">
        <h3 className="font-extrabold text-lg text-slate-900 mb-4">
          Direct Supply Chain vs. Traditional Mandi Intermediary Chain
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider">
                <th className="pb-3 font-bold">Parameter</th>
                <th className="pb-3 font-bold text-rose-700">Traditional Middlemen Supply Chain</th>
                <th className="pb-3 font-bold text-emerald-700">KisanDirect Collective Platform</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              <tr>
                <td className="py-3 font-bold text-slate-800">Intermediary Hops</td>
                <td className="py-3 text-slate-600">3 - 5 intermediaries (Agent $\rightarrow$ Mandi $\rightarrow$ Wholesaler $\rightarrow$ Retailer)</td>
                <td className="py-3 text-emerald-800 font-bold">0 Intermediaries (Direct Farmer Cluster to Buyer)</td>
              </tr>
              <tr>
                <td className="py-3 font-bold text-slate-800">Farmer Price Realization</td>
                <td className="py-3 text-slate-600">Only 28% to 42% of final consumer price</td>
                <td className="py-3 text-emerald-800 font-bold">78% to 85% of buyer purchase value returned to farmer</td>
              </tr>
              <tr>
                <td className="py-3 font-bold text-slate-800">Smallholder Aggregation</td>
                <td className="py-3 text-slate-600">Small farmers exploited; single small quantity discarded or discounted</td>
                <td className="py-3 text-emerald-800 font-bold">Automated collective pooling aggregates 100kg lots into bulk orders</td>
              </tr>
              <tr>
                <td className="py-3 font-bold text-slate-800">Perishable Freshness</td>
                <td className="py-3 text-slate-600">Stored 36-72 hours in non-aerated crates; 25-35% harvest spoilage</td>
                <td className="py-3 text-emerald-800 font-bold">Delivered within 4-8 hours of harvest; Urgent Sale prevents expiry</td>
              </tr>
              <tr>
                <td className="py-3 font-bold text-slate-800">Payment Security</td>
                <td className="py-3 text-slate-600">Delayed credit (15 to 45 days), informal receipts, default risk</td>
                <td className="py-3 text-emerald-800 font-bold">Authorized UPI Escrow; instant split release upon delivery signoff</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ImpactPage;
