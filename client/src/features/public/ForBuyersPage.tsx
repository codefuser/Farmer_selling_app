import React from 'react';
import {
  ShieldCheck,
  Truck,
  Clock,
  CheckCircle2,
  Building,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface ForBuyersPageProps {
  onNavigate: (view: string) => void;
}

export const ForBuyersPage: React.FC<ForBuyersPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="bg-gradient-to-r from-slate-900 to-emerald-950 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="max-w-3xl relative z-10">
          <span className="text-xs uppercase font-bold tracking-wider text-emerald-400 bg-emerald-900/40 px-3 py-1 rounded-full border border-emerald-500/30">
            Commercial Buyers & Institutions
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mt-3 leading-tight">
            Direct Farm Sourcing with Certified Freshness & Bulk Reliability.
          </h1>
          <p className="text-slate-300 text-sm sm:text-base mt-4 leading-relaxed">
            Source morning-harvested produce directly from certified farmer clusters. Eliminate multi-day warehouse storage, stale shelf rot, and volatile wholesale broker markups.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <button
              onClick={() => onNavigate('buyer-post-demand')}
              className="px-6 py-3 rounded-2xl bg-emerald-500 text-slate-950 font-extrabold text-sm shadow-lg hover:bg-emerald-400 transition"
            >
              Post a Bulk Demand
            </button>
            <button
              onClick={() => onNavigate('buyer-marketplace')}
              className="px-6 py-3 rounded-2xl bg-white/10 text-white font-bold text-sm border border-white/20 hover:bg-white/20 backdrop-blur-md transition"
            >
              Browse Active Batches
            </button>
          </div>
        </div>
      </div>

      {/* Target Buyer Categories */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Tailored for B2B Commercial Segments</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { title: 'Hotels & Banquets', desc: 'Guaranteed 6 AM dock delivery of ripe, firm tomatoes and vegetables.' },
            { title: 'Supermarket Chains', desc: 'Direct lot traceability with verified damage deduction at collection hubs.' },
            { title: 'Restaurants & Kitchens', desc: 'Daily bulk orders matched from nearby farm radius within 15 km.' },
            { title: 'Wholesale Distributors', desc: 'Collective pooling aggregates 1 to 5 tons from organized farmer clusters.' },
          ].map((cat, idx) => (
            <div key={idx} className="glass-card rounded-2xl p-5 border-slate-200">
              <h3 className="font-bold text-sm text-slate-900">{cat.title}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{cat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ForBuyersPage;
