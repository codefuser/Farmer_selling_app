import React from 'react';
import {
  FileText,
  Boxes,
  Truck,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Sprout,
  ShoppingBag,
  KeyRound,
  TrendingUp,
} from 'lucide-react';

interface HowItWorksPageProps {
  onNavigate: (view: string) => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ onNavigate }) => {
  const steps = [
    {
      num: '01',
      title: 'Farmer Harvest Submission',
      desc: 'Local farmers submit harvest details (crop variety, quantity, harvest date, photos, and fair price expectation) via the web portal or Tamil voice assistant.',
      icon: Sprout,
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    {
      num: '02',
      title: 'Hub Inspection & Direct Procurement',
      desc: 'Ulavar2Ulagam agricultural quality officers review submissions, grade produce (Grade A/B), and execute purchase intake into the Salem Central Hub at guaranteed rates.',
      icon: ShieldCheck,
      color: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    },
    {
      num: '03',
      title: 'Central Inventory & Transparent Pricing',
      desc: 'Procured produce is weighed, sorted, and cataloged into Central Inventory with live stock counts and affordable retail pricing for family consumers.',
      icon: Boxes,
      color: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    {
      num: '04',
      title: 'Customer Ordering & Central Checkout',
      desc: 'Households browse verified fresh produce directly from Central Inventory, add items to cart, and complete orders with guaranteed same-day dispatch.',
      icon: ShoppingBag,
      color: 'bg-teal-50 text-teal-800 border-teal-200',
    },
    {
      num: '05',
      title: 'Dedicated Fleet Delivery with OTP Handover',
      desc: 'Central Hub assigns deliveries to company delivery partners. Handover is verified using an encrypted 4-digit customer delivery OTP to ensure 100% order fidelity.',
      icon: KeyRound,
      color: 'bg-purple-50 text-purple-800 border-purple-200',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-3xl mx-auto">
        <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full">
          Ulavar2Ulagam Operating Architecture
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 mt-4 tracking-tight">
          How Ulavar2Ulagam Operates
        </h1>
        <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
          "From Farmers to Your Family, Directly." (உழவர் to உலகம் - விவசாயிகளிடமிருந்து உங்கள் குடும்பத்திற்கு நேரடியாக.)
          We replace multi-tier commission middlemen with an organized direct-procurement and central inventory fulfillment hub.
        </p>
      </div>

      {/* 5-Step Journey */}
      <div className="space-y-4">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-5 hover:border-emerald-300 transition"
            >
              <div
                className={`w-14 h-14 rounded-2xl border flex flex-col items-center justify-center shrink-0 ${step.color}`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-[10px] font-black mt-0.5">{step.num}</span>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Traditional Mandi vs Ulavar2Ulagam Comparison */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Systemic Impact
          </span>
          <h2 className="text-2xl font-black mt-1">
            Why Ulavar2Ulagam Transformed the Traditional Chain
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2">
            <h4 className="font-bold text-rose-400 text-sm">
              ❌ Conventional Mandi Auction System
            </h4>
            <ul className="space-y-2 text-slate-300">
              <li>• 3 to 4 intermediary middlemen take 25% - 40% margin.</li>
              <li>• Speculative bidding forces farmers to sell below cost during peak arrival.</li>
              <li>• Unregulated commission agent fees and hidden weighing deductions.</li>
              <li>• Perishable produce sits for 48-72 hours before reaching city homes.</li>
            </ul>
          </div>

          <div className="bg-white/5 border border-emerald-500/30 rounded-2xl p-5 space-y-2">
            <h4 className="font-bold text-emerald-400 text-sm">
              ✓ Ulavar2Ulagam Direct Central Model
            </h4>
            <ul className="space-y-2 text-slate-300">
              <li>• Single organized intermediary ensuring fair agreed farmer payouts.</li>
              <li>• Central Inventory with real stock tracking and quality assurance.</li>
              <li>• Zero auction cuts or middleman commission deductions for farmers.</li>
              <li>• Same-day doorstep delivery to household families with secure OTP.</li>
            </ul>
          </div>
        </div>

        <div className="pt-4 text-center">
          <button
            onClick={() => onNavigate('buyer-marketplace')}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg transition"
          >
            Explore Central Inventory Store
          </button>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksPage;
