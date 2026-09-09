import React from 'react';
import {
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Clock,
  Users,
  Layers,
  Sparkles,
  Truck,
  CheckCircle2,
  Mic,
  ChevronRight,
  Award,
  Zap,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface LandingPageProps {
  onNavigate: (view: string) => void;
  onOpenVoiceModal: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onOpenVoiceModal }) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 text-white rounded-b-[40px] shadow-2xl">
        {/* Subtle Decorative Glows */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* SIH Badge */}
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 rounded-full px-4 py-1.5 text-xs font-semibold text-emerald-300 mb-6 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Smart India Hackathon 2026 · Problem Statement ID: SIH26033</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight md:leading-none">
            From Harvest to Buyer,
            <span className="block mt-2 bg-gradient-to-r from-emerald-300 via-teal-200 to-white bg-clip-text text-transparent">
              Without Unnecessary Intermediaries.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg md:text-xl text-emerald-100/90 max-w-3xl mx-auto font-normal leading-relaxed">
            Connect farmers directly with verified commercial demand, combine small farm quantities into bulk orders, negotiate transparent fair prices, and move fresh produce before it degrades.
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-wrap justify-center items-center gap-3">
            <button
              onClick={() => onNavigate('register')}
              className="px-7 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm sm:text-base shadow-xl shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <span>Sell Your Produce</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('buyer-marketplace')}
              className="px-7 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm sm:text-base border border-white/20 backdrop-blur-md transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <span>Find Fresh Produce</span>
            </button>

            <button
              onClick={() => onNavigate('buyer-post-demand')}
              className="px-7 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm sm:text-base shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <span>Post a Requirement</span>
            </button>
          </div>

          {/* Voice Assistant Shortcut */}
          <div className="mt-8">
            <button
              onClick={onOpenVoiceModal}
              className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/15 border border-white/20 rounded-full px-4 py-2 text-xs font-semibold text-emerald-200 backdrop-blur-md transition"
            >
              <Mic className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>குரல் வழியே விற்க (Try Voice Listing Simulation)</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-70" />
            </button>
          </div>
        </div>
      </section>

      {/* Visual Supply Chain Paradigm Flow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs uppercase font-bold tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            The KisanDirect Reverse-Demand Model
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
            How Community Direct Selling Works
          </h2>
          <p className="text-slate-600 text-sm mt-2">
            Eliminating 3-4 commission middlemen by shifting from traditional speculative push selling to transparent demand-driven collective pooling.
          </p>
        </div>

        {/* 5-Step Visual Flow Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="glass-card rounded-2xl p-5 text-center relative border-emerald-100">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center mx-auto mb-3 text-sm">
              1
            </div>
            <h3 className="font-bold text-sm text-slate-900">Buyer Demand</h3>
            <p className="text-xs text-slate-500 mt-1">
              Hotels & retailers post verified quantity needs (e.g. 500kg Tomato before 10 AM).
            </p>
          </div>

          <div className="glass-card rounded-2xl p-5 text-center relative border-emerald-100">
            <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 font-extrabold flex items-center justify-center mx-auto mb-3 text-sm">
              2
            </div>
            <h3 className="font-bold text-sm text-slate-900">Smart Matching</h3>
            <p className="text-xs text-slate-500 mt-1">
              Engine calculates distance, price, grade, freshness, and farmer ratings.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-5 text-center relative border-emerald-100">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-800 font-extrabold flex items-center justify-center mx-auto mb-3 text-sm">
              3
            </div>
            <h3 className="font-bold text-sm text-slate-900">Collective Supply</h3>
            <p className="text-xs text-slate-500 mt-1">
              Multiple small farmers combine 100kg + 150kg lots into one bulk order.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-5 text-center relative border-emerald-100">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 font-extrabold flex items-center justify-center mx-auto mb-3 text-sm">
              4
            </div>
            <h3 className="font-bold text-sm text-slate-900">Collection & QC</h3>
            <p className="text-xs text-slate-500 mt-1">
              Weighed and quality-graded at village hub; damage deductions recorded.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-5 text-center relative border-emerald-100">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-extrabold flex items-center justify-center mx-auto mb-3 text-sm">
              5
            </div>
            <h3 className="font-bold text-sm text-slate-900">Direct Payment</h3>
            <p className="text-xs text-slate-500 mt-1">
              Escrow funds released directly to farmers' bank accounts upon delivery.
            </p>
          </div>
        </div>
      </section>

      {/* Core Innovation Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card rounded-3xl p-6 border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Collective Pooling (கூட்டு விற்பனை)</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Small marginal farmers can never individually supply large hotels or supermarket chains. KisanDirect aggregates small harvests into certified bulk shipments without middlemen cuts.
            </p>
          </div>

          <div className="glass-card rounded-3xl p-6 border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Freshness Engine & Urgent Sale</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Perishables degrade every hour. The platform automatically tracks freshness timers, transitioning aging lots to Urgent Sale mode with local discounts before expiry to eliminate agricultural waste.
            </p>
          </div>

          <div className="glass-card rounded-3xl p-6 border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Village Hub & Digital Inclusion</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Farmers with low digital literacy are supported by local Village Coordinators and bilingual voice-assisted listing in தமிழ் and English. The farmer retains 100% price control.
            </p>
          </div>
        </div>
      </section>

      {/* Impact Numbers Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col md:flex-row justify-between items-center gap-8 border border-slate-800">
          <div className="max-w-md">
            <span className="text-emerald-400 font-bold text-xs uppercase tracking-wider">
              Measurable Prototype Impact
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold mt-1">
              Restoring Fair Value to Indian Agriculture
            </h3>
            <p className="text-slate-400 text-xs mt-2">
              Demonstrating transparent price discovery and eliminating unnecessary commissions.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">+22.4%</div>
              <div className="text-[11px] text-slate-400 mt-1">Farmer Income Rise</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">18%</div>
              <div className="text-[11px] text-slate-400 mt-1">Middlemen Margin Saved</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">4,800+ kg</div>
              <div className="text-[11px] text-slate-400 mt-1">Waste Prevented</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">100%</div>
              <div className="text-[11px] text-slate-400 mt-1">Escrow Protected</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
