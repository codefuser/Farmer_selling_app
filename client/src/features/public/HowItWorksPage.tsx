import React from 'react';
import {
  FileText,
  Cpu,
  Layers,
  Handshake,
  Warehouse,
  Truck,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface HowItWorksPageProps {
  onNavigate: (view: string) => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ onNavigate }) => {
  const steps = [
    {
      num: '01',
      title: 'Buyer Creates Demand',
      desc: 'Hotels, restaurants, supermarkets, or wholesalers post specific produce requirements (e.g. 500 kg Tomato, Grade A, required before 10 AM, budget ₹20 - ₹25/kg).',
      icon: FileText,
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    {
      num: '02',
      title: 'Matching Engine Finds Nearby Farmers',
      desc: 'Platform executes multi-factor scoring based on Distance, Harvest Time, Grade, Farmer Rating, and Price Compatibility. Lowest price does NOT blindly win.',
      icon: Cpu,
      color: 'bg-teal-50 text-teal-800 border-teal-200',
    },
    {
      num: '03',
      title: 'Collective Supply Aggregation',
      desc: 'Small farmers cannot supply 500 kg individually. KisanDirect pools Farmer A (100kg) + Farmer B (150kg) + Farmer C (100kg) + Farmer D (150kg) into one bulk delivery.',
      icon: Layers,
      color: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    },
    {
      num: '04',
      title: 'Fair Negotiation & Transparent Deals',
      desc: 'Buyers send offers; farmers can Accept, Reject, or Counter-Offer with clear reference market price guidance. Every turn is saved in audit history.',
      icon: Handshake,
      color: 'bg-blue-50 text-blue-800 border-blue-200',
    },
    {
      num: '05',
      title: 'Village Collection Hub & Quality Grading',
      desc: 'Produce is brought to the village hub. Digital coordinators weigh the batch, check grade, record damage %, and update verified inventory.',
      icon: Warehouse,
      color: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    {
      num: '06',
      title: 'Dispatched & Tracked Delivery',
      desc: 'Logistics fleet collects the bundled shipment. Buyer tracks route progress in real-time on live map telemetry until destination delivery dock.',
      icon: Truck,
      color: 'bg-purple-50 text-purple-800 border-purple-200',
    },
    {
      num: '07',
      title: 'Escrow Payment Release & Mutual Rating',
      desc: 'Upon buyer inspection and delivery signoff, escrow funds are instantly split and released to each participating farmer. Both parties rate each other.',
      icon: CheckCircle2,
      color: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-3xl mx-auto">
        <span className="text-xs uppercase font-bold tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
          SIH 2026 Process Architecture
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-4">
          How KisanDirect Solves the Intermediary Crisis
        </h1>
        <p className="text-slate-600 text-sm mt-3 leading-relaxed">
          Traditional agricultural mandis trap farmers in 3 to 4 intermediary hops: Village Commission Agent $\rightarrow$ Wholesaler $\rightarrow$ Sub-Wholesaler $\rightarrow$ Retailer. KisanDirect connects buyers directly with aggregated farm clusters.
        </p>
      </div>

      {/* 7-Step Interactive Journey */}
      <div className="space-y-6">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={idx}
              className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center gap-6 hover:border-emerald-300 transition shadow-sm"
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center font-extrabold text-xl shrink-0 border ${step.color}`}
              >
                {step.num}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5 text-emerald-700" />
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">{step.title}</h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Perishable Freshness Safeguard Box */}
      <div className="bg-amber-50/80 border-2 border-amber-300 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-2">
          <ShieldAlert className="w-6 h-6 text-amber-700 shrink-0" />
          <h3 className="text-base font-bold text-amber-900">
            Rule of Real Agriculture: The Freshness Degradation Engine
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
          A platform cannot promise that every farmer will always sell everything immediately. For perishable crops like tomatoes, brinjals, and leafy greens, KisanDirect tracks harvest age hourly. If a listing approaches sell-by time without an order, it automatically transitions into <strong>Urgent Sale Mode</strong> (notifying nearby hotels at a discounted price) and finally expires to prevent stale produce from being delivered.
        </p>
      </div>

      <div className="text-center pt-4">
        <button
          onClick={() => onNavigate('register')}
          className="px-8 py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-sm shadow-xl transition flex items-center gap-2 mx-auto"
        >
          <span>Join the Direct Community</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default HowItWorksPage;
