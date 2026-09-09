import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  CheckCircle2,
  Mic,
  Truck,
  Layers,
  MapPin,
  RefreshCw,
  Building2,
  Users,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import { VegetableMarketRate, MandiMarketSummary, MandiInfo } from '../../types';

interface LandingPageProps {
  onNavigate: (view: string) => void;
  onOpenVoiceModal: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onOpenVoiceModal }) => {
  const { language, t } = useLanguage();

  const [mandis, setMandis] = useState<MandiInfo[]>([
    { id: 'salem', name: 'Salem VOC Central Mandi', district: 'Salem' },
    { id: 'koyambedu', name: 'Koyambedu Wholesale Market', district: 'Chennai' },
    { id: 'oddanchatram', name: 'Oddanchatram Central Market', district: 'Dindigul' },
    { id: 'coimbatore', name: 'MGR Wholesale Mandi', district: 'Coimbatore' },
  ]);
  const [selectedMandiId, setSelectedMandiId] = useState<string>('salem');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [ratesData, setRatesData] = useState<VegetableMarketRate[]>([]);
  const [summaryMeta, setSummaryMeta] = useState<{
    mandiName: string;
    totalArrival: number;
    date: string;
  } | null>(null);
  const [loadingRates, setLoadingRates] = useState<boolean>(true);

  // Fetch live market vegetable rates
  const fetchMarketRates = async (mandiId: string, search: string = '') => {
    setLoadingRates(true);
    try {
      const selected = mandis.find((m) => m.id === mandiId) || mandis[0];
      const res = await api.getDailyMarketPrices({
        district: selected.district,
        mandiId,
        search,
      });

      if (res?.summary?.rates) {
        setRatesData(res.summary.rates);
        setSummaryMeta({
          mandiName: res.summary.mandiName,
          totalArrival: res.summary.totalArrivalQuintals,
          date: res.summary.date,
        });
      }
      if (res?.availableMandis) {
        setMandis(res.availableMandis);
      }
    } catch (err) {
      console.error('Failed to load market rates:', err);
    } finally {
      setLoadingRates(false);
    }
  };

  useEffect(() => {
    fetchMarketRates(selectedMandiId, searchQuery);
  }, [selectedMandiId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMarketRates(selectedMandiId, searchQuery);
  };

  return (
    <div className="space-y-16 pb-16 bg-[#fcfdfc]">
      {/* 1. MINIMAL HERO SECTION */}
      <section className="pt-12 pb-14 md:pt-16 md:pb-20 border-b border-slate-200/80 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Subtle Institutional Tag */}
          <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-3.5 py-1 text-xs font-medium text-slate-700 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Direct Agricultural Marketplace · Eliminating Commission Intermediaries</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight">
            Connecting Farmers Directly with Commercial Buyers.
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Move fresh produce directly from farm harvest to hotels, caterers, and retailers. Combined bulk pooling, transparent APMC benchmark pricing, and guaranteed same-day escrow settlements.
          </p>

          {/* Clean High-Contrast Action CTAs */}
          <div className="mt-8 flex flex-wrap justify-center items-center gap-3">
            <button
              onClick={() => onNavigate('register')}
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition shadow-sm flex items-center gap-2"
            >
              <span>Join as Farmer</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigate('buyer-marketplace')}
              className="px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-300 transition flex items-center gap-2"
            >
              <span>Browse Produce</span>
            </button>

            <button
              onClick={() => onNavigate('buyer-post-demand')}
              className="px-6 py-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold text-sm transition"
            >
              <span>Post Requirement</span>
            </button>
          </div>

          {/* Voice Listing Tool for Farmers */}
          <div className="mt-6">
            <button
              onClick={onOpenVoiceModal}
              className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-emerald-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-lg px-3 py-1.5 transition"
            >
              <Mic className="w-3.5 h-3.5 text-emerald-600" />
              <span>குரல் வழியே பதிவு செய்ய (Tamil Voice Listing Simulator)</span>
            </button>
          </div>

          {/* 3 Core Trust Markers */}
          <div className="mt-12 pt-8 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left max-w-3xl mx-auto">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Zero Middlemen Margins</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Farmers retain 15-20% higher earnings compared to conventional auction commissions.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Escrow Secured Payments</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Buyer payments are pre-authorized and released directly to farmers upon quality verification.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Village Hub Aggregation</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Local coordinators weigh, grade, and combine small farmer lots into full truckloads.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DAILY LIVE VEGETABLE MARKET RATES WIDGET */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
          {/* Header & Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Real-time APMC Mandi Index
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                Daily Live Vegetable Market Rates
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Updated today · Official APMC mandi benchmark vs KisanDirect direct fair payout
              </p>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Mandi Selector */}
              <div className="relative">
                <select
                  value={selectedMandiId}
                  onChange={(e) => setSelectedMandiId(e.target.value)}
                  className="bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {mandis.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Bar */}
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Search vegetable / காய்..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-50 text-slate-800 text-xs px-3 py-2 pl-8 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-44 sm:w-56"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </form>

              <button
                onClick={() => fetchMarketRates(selectedMandiId, searchQuery)}
                className="w-8 h-8 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 transition"
                title="Refresh Rates"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingRates ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Mandi Summary Strip */}
          {summaryMeta && (
            <div className="py-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 bg-slate-50/60 px-4 rounded-xl mt-4">
              <div>
                Market: <strong className="text-slate-800">{summaryMeta.mandiName}</strong> · Date: <span className="text-slate-700">{summaryMeta.date}</span>
              </div>
              <div>
                Total Traded Volume: <strong className="text-slate-800">{summaryMeta.totalArrival.toLocaleString()} Quintals</strong>
              </div>
            </div>
          )}

          {/* Rates Table / Grid */}
          <div className="mt-6 overflow-x-auto">
            {loadingRates && ratesData.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Loading live APMC vegetable rates...
              </div>
            ) : ratesData.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No vegetables found matching "{searchQuery}".
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-3">Produce / Commodity</th>
                    <th className="py-3 px-3">Mandi Benchmark</th>
                    <th className="py-3 px-3">Price Range (Min - Max)</th>
                    <th className="py-3 px-3">24h Trend</th>
                    <th className="py-3 px-3 bg-emerald-50/40 rounded-t-lg">
                      <span className="text-emerald-900 font-bold">KisanDirect Fair Price</span>
                    </th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {ratesData.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Commodity Name & Image */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                            loading="lazy"
                          />
                          <div>
                            <div className="font-bold text-slate-900 text-sm">
                              {language === 'ta' ? item.nameTamil : item.name}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {language === 'ta' ? item.name : item.nameTamil}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Official Modal Price */}
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-900 text-sm">₹{item.modalPrice} <span className="text-[10px] font-normal text-slate-500">/ kg</span></div>
                        <div className="text-[10px] text-slate-400">APMC Modal</div>
                      </td>

                      {/* Min - Max */}
                      <td className="py-3.5 px-3 text-slate-600 font-medium">
                        ₹{item.minPrice} - ₹{item.maxPrice} / kg
                      </td>

                      {/* Trend */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 font-semibold text-xs px-2 py-0.5 rounded-md ${
                            item.isRising
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : 'bg-rose-50 text-rose-700 border border-rose-100'
                          }`}
                        >
                          {item.isRising ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {item.trendPercentage > 0 ? `+${item.trendPercentage}%` : `${item.trendPercentage}%`}
                        </span>
                      </td>

                      {/* KisanDirect Fair Deal Price */}
                      <td className="py-3.5 px-3 bg-emerald-50/30">
                        <div className="font-bold text-emerald-800 text-sm">
                          ₹{item.kisanDirectPrice} <span className="text-[10px] font-normal text-emerald-700">/ kg</span>
                        </div>
                        <div className="text-[10px] text-emerald-600 font-medium">
                          +₹{item.farmerBenefitPerKg}/kg direct to farmer
                        </div>
                      </td>

                      {/* Action CTA */}
                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={() => onNavigate('register')}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-semibold px-3 py-1.5 rounded-lg transition"
                        >
                          Trade at this rate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>

      {/* 3. REVERSE DEMAND MODEL - 4 CLEAN STEPS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs uppercase font-bold tracking-wider text-slate-500">
            How The Ecosystem Works
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
            The Reverse-Demand Marketplace Flow
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-1.5 leading-relaxed">
            Replacing speculative auction mandi pushing with verified commercial purchase orders and organized village pooling.
          </p>
        </div>

        {/* 4 Minimal Step Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm">
            <span className="text-xs font-bold text-slate-400 block mb-2">01</span>
            <h3 className="font-bold text-sm text-slate-900">Commercial Demand</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Hotels, canteens, and retailers submit confirmed bulk requirements with target delivery times and grades.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm">
            <span className="text-xs font-bold text-slate-400 block mb-2">02</span>
            <h3 className="font-bold text-sm text-slate-900">Collective Supply Pool</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Multiple smallholder farmers combine 100kg + 150kg lots into one cohesive bulk fulfillment lot.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm">
            <span className="text-xs font-bold text-slate-400 block mb-2">03</span>
            <h3 className="font-bold text-sm text-slate-900">Village Hub QC</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Local village coordinators weigh, grade, and issue digital receipts before loading onto consolidated transport.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm">
            <span className="text-xs font-bold text-slate-400 block mb-2">04</span>
            <h3 className="font-bold text-sm text-slate-900">Instant Escrow Payout</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Upon delivery confirmation, escrow funds are automatically disbursed directly to farmers' bank accounts.
            </p>
          </div>
        </div>
      </section>

      {/* 4. CLEAN METRICS / IMPACT BANNER */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-2xl p-8 sm:p-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center md:text-left">
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400">+22.4%</div>
              <div className="text-xs text-slate-400 mt-1">Average Farmer Realization over Mandi Auction</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white">&lt; 18 hrs</div>
              <div className="text-xs text-slate-400 mt-1">Average Harvest-to-Buyer Kitchen Delivery Time</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400">₹0</div>
              <div className="text-xs text-slate-400 mt-1">Auction Middlemen Commissions Deducted</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white">100%</div>
              <div className="text-xs text-slate-400 mt-1">Pre-authorized Escrow Backed Commitments</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
