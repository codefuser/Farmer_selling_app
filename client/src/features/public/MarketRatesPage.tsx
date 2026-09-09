import React, { useState, useEffect } from 'react';
import {
  Search,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  MapPin,
  Calendar,
  Layers,
  ArrowRight,
  Filter,
  Sparkles,
  CheckCircle2,
  SlidersHorizontal,
  Table,
  LayoutGrid,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import { VegetableMarketRate, MandiInfo, MandiMarketSummary } from '../../types';

interface MarketRatesPageProps {
  onNavigate: (view: string) => void;
}

export const MarketRatesPage: React.FC<MarketRatesPageProps> = ({ onNavigate }) => {
  const { language, t } = useLanguage();

  const [mandis, setMandis] = useState<MandiInfo[]>([
    { id: 'salem', name: 'Salem VOC Central Mandi', district: 'Salem' },
    { id: 'koyambedu', name: 'Koyambedu Wholesale Market', district: 'Chennai' },
    { id: 'oddanchatram', name: 'Oddanchatram Central Market (Dindigul)', district: 'Dindigul' },
    { id: 'coimbatore', name: 'MGR Wholesale Mandi (Coimbatore)', district: 'Coimbatore' },
    { id: 'madurai', name: 'Mattuthavani Central Market (Madurai)', district: 'Madurai' },
    { id: 'trichy', name: 'Gandhi Market (Tiruchirappalli)', district: 'Tiruchirappalli' },
    { id: 'erode', name: 'Perundurai Regulated Agri Market', district: 'Erode' },
    { id: 'dharmapuri', name: 'Dharmapuri Tomato & Agri Hub', district: 'Dharmapuri' },
    { id: 'hosur', name: 'Hosur / Krishnagiri Vegetable Hub', district: 'Krishnagiri' },
    { id: 'tirunelveli', name: 'Nayanar Central Market (Tirunelveli)', district: 'Tirunelveli' },
    { id: 'vellore', name: 'Nethaji Wholesale Market (Vellore)', district: 'Vellore' },
    { id: 'theni', name: 'Cumbum Valley Regulated Market', district: 'Theni' },
    { id: 'bangalore', name: 'Kalasipalya APMC Mandi (Bengaluru)', district: 'Bengaluru' },
  ]);

  const [selectedMandiId, setSelectedMandiId] = useState<string>('salem');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const [ratesData, setRatesData] = useState<VegetableMarketRate[]>([]);
  const [summaryMeta, setSummaryMeta] = useState<MandiMarketSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchRates = async () => {
    setLoading(true);
    try {
      const selected = mandis.find((m) => m.id === selectedMandiId) || mandis[0];
      const res = await api.getDailyMarketPrices({
        district: selected.district,
        mandiId: selectedMandiId,
        category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
        search: searchQuery,
      });

      if (res?.summary) {
        setSummaryMeta(res.summary);
        setRatesData(res.summary.rates);
      }
      if (res?.availableMandis && res.availableMandis.length > 0) {
        setMandis(res.availableMandis);
      }
    } catch (err) {
      console.error('Failed to load market rates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, [selectedMandiId, selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRates();
  };

  const categories = [
    { id: 'ALL', label: 'All Vegetables', labelTa: 'அனைத்து காய்கள்' },
    { id: 'STAPLE', label: 'Staples', labelTa: 'அத்தியாவசியம் (தக்காளி, வெங்காயம்...)' },
    { id: 'COMMON', label: 'Common Produce', labelTa: 'நாட்டு காய்கள்' },
    { id: 'ROOT', label: 'Roots & Tubers', labelTa: 'கிழங்கு வகைகள்' },
    { id: 'GOURD', label: 'Gourds & Climbers', labelTa: 'கொடி வகைகள்' },
    { id: 'SPICE_GREEN', label: 'Spices & Greens', labelTa: 'இஞ்சி, பூண்டு & கீரைகள்' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. PAGE TITLE & HEADER */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200/80 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Tamil Nadu Daily Mandi Intelligence Feed</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {language === 'ta' ? 'அனைத்து சந்தை & காய்கறி நேரடி விலை நிலவரம்' : 'Live Vegetable Market Rates Across All Towns'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Official wholesale APMC benchmark prices vs KisanDirect direct fair payout across Tamil Nadu markets.
            </p>
          </div>

          {/* Quick Date & Refresh Button */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-2 rounded-xl border border-slate-200">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{summaryMeta?.date || new Date().toISOString().split('T')[0]}</span>
            </div>
            <button
              onClick={fetchRates}
              className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 transition shadow-sm"
              title="Refresh Market Rates"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Top Mandi Stat Summary Cards */}
        {summaryMeta && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/70">
              <div className="text-[10px] uppercase font-bold text-slate-400">Selected Market</div>
              <div className="text-sm font-extrabold text-slate-900 truncate mt-0.5">{summaryMeta.mandiName}</div>
              <div className="text-[10px] text-slate-500">{summaryMeta.district} District</div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/70">
              <div className="text-[10px] uppercase font-bold text-slate-400">Today's Total Arrivals</div>
              <div className="text-sm font-extrabold text-slate-900 mt-0.5">
                {summaryMeta.totalArrivalQuintals.toLocaleString()} Quintals
              </div>
              <div className="text-[10px] text-emerald-600 font-semibold">Active Trading Volume</div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/70">
              <div className="text-[10px] uppercase font-bold text-slate-400">Top Price Gainer</div>
              <div className="text-sm font-extrabold text-emerald-700 mt-0.5">
                {summaryMeta.topGainers[0]?.name || 'Capsicum'}
              </div>
              <div className="text-[10px] text-emerald-600 font-bold">
                ▲ +{summaryMeta.topGainers[0]?.trend || 1.2}% today
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/70">
              <div className="text-[10px] uppercase font-bold text-slate-400">KisanDirect Farmer Margin</div>
              <div className="text-sm font-extrabold text-slate-900 mt-0.5">+15% to +20%</div>
              <div className="text-[10px] text-slate-500">Above APMC auction payouts</div>
            </div>
          </div>
        )}
      </div>

      {/* 2. TOWN & MANDI SELECTOR TABS */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>Select Town / APMC Market (ஊர் / மண்டி தேர்ந்தெடுக்கவும்)</span>
          </label>
          <span className="text-[11px] text-slate-400">{mandis.length} Mandis Available</span>
        </div>

        {/* Scrollable Town Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
          {mandis.map((mandi) => {
            const active = selectedMandiId === mandi.id;
            return (
              <button
                key={mandi.id}
                onClick={() => setSelectedMandiId(mandi.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                  active
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                {mandi.district} ({mandi.name.split(' ')[0]})
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. CATEGORY & SEARCH CONTROLS */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {categories.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition shrink-0 ${
                    active
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
                  }`}
                >
                  {language === 'ta' ? cat.labelTa : cat.label}
                </button>
              );
            })}
          </div>

          {/* Search Bar & View Mode Toggle */}
          <div className="flex items-center gap-2 shrink-0">
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

            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                }`}
                title="Table View"
              >
                <Table className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. RATES DISPLAY (GRID / TABLE) */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">
          Loading live rates for {selectedMandiId}...
        </div>
      ) : ratesData.length === 0 ? (
        <div className="py-16 text-center text-slate-400 text-sm bg-white rounded-2xl border border-slate-200">
          No vegetables found matching your criteria.
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ratesData.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-500/40 p-5 shadow-sm hover:shadow-md transition-all space-y-4"
            >
              {/* Vegetable Header */}
              <div className="flex items-start gap-3">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-14 h-14 rounded-xl object-cover border border-slate-100 shrink-0"
                  loading="lazy"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="font-extrabold text-slate-900 text-base leading-tight truncate">
                      {item.nameTamil}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        item.isRising
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : 'bg-rose-50 text-rose-700 border border-rose-100'
                      }`}
                    >
                      {item.isRising ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {item.trendPercentage > 0 ? `+${item.trendPercentage}%` : `${item.trendPercentage}%`}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 truncate mt-0.5">{item.name}</div>
                  <span className="inline-block mt-1 text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                    {item.mandi}
                  </span>
                </div>
              </div>

              {/* Pricing Breakdown Grid */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">APMC Modal Rate</div>
                  <div className="font-extrabold text-slate-900 text-lg leading-tight mt-0.5">
                    ₹{item.modalPrice} <span className="text-[11px] font-normal text-slate-500">/ kg</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Min: ₹{item.minPrice} · Max: ₹{item.maxPrice}</div>
                </div>

                <div className="bg-emerald-50/70 p-2 rounded-lg border border-emerald-200/60">
                  <div className="text-[10px] uppercase font-bold text-emerald-800">KisanDirect Fair Price</div>
                  <div className="font-extrabold text-emerald-800 text-lg leading-tight mt-0.5">
                    ₹{item.kisanDirectPrice} <span className="text-[11px] font-normal text-emerald-700">/ kg</span>
                  </div>
                  <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                    +₹{item.farmerBenefitPerKg}/kg direct gain
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onNavigate('register')}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <span>Trade {item.nameTamil} at this rate</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
                <th className="py-3 px-4">Vegetable / Commodity</th>
                <th className="py-3 px-4">Market / Mandi</th>
                <th className="py-3 px-4">Modal Price</th>
                <th className="py-3 px-4">Range (Min - Max)</th>
                <th className="py-3 px-4">24h Trend</th>
                <th className="py-3 px-4 bg-emerald-50/60 text-emerald-900">KisanDirect Fair Price</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {ratesData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <span className="font-bold text-slate-900 block">{item.nameTamil}</span>
                        <span className="text-[10px] text-slate-400">{item.name}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{item.mandi}</td>
                  <td className="py-3 px-4 font-extrabold text-slate-900">₹{item.modalPrice} / kg</td>
                  <td className="py-3 px-4 text-slate-500">₹{item.minPrice} - ₹{item.maxPrice}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-0.5 font-bold text-xs ${
                        item.isRising ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {item.isRising ? '▲' : '▼'} {item.trendPercentage}%
                    </span>
                  </td>
                  <td className="py-3 px-4 bg-emerald-50/30">
                    <span className="font-extrabold text-emerald-800">₹{item.kisanDirectPrice} / kg</span>
                    <span className="text-[10px] text-emerald-600 block">+₹{item.farmerBenefitPerKg} to farmer</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onNavigate('register')}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-3 py-1 rounded-lg"
                    >
                      Trade
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MarketRatesPage;
