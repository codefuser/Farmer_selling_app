import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Search,
  CheckCircle2,
  Truck,
  MapPin,
  RefreshCw,
  ShoppingBag,
  Sprout,
  PackageCheck,
  Sparkles,
  Plus,
  Check,
  Star,
  Clock,
  Award,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import api from '../../services/api';
import { CentralInventoryProduct, VegetableMarketRate, MandiInfo } from '../../types';

interface LandingPageProps {
  onNavigate: (view: string, params?: any) => void;
  onOpenVoiceModal: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onOpenVoiceModal }) => {
  const { language, t } = useLanguage();
  const { addStoreProduct, openCart } = useCart();

  // Featured Products State (Direct Central Inventory)
  const [featuredProducts, setFeaturedProducts] = useState<CentralInventoryProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  // Mandi Comparison State
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

  // Fetch Central Store Products
  useEffect(() => {
    let mounted = true;
    const loadProducts = async () => {
      setLoadingProducts(true);
      try {
        const categoryParam = selectedCategory === 'ALL' ? undefined : selectedCategory;
        const res = await api.getStoreProducts({ category: categoryParam, limit: 8 });
        if (mounted && res) {
          const list = Array.isArray(res) ? res : (res as any).products || [];
          setFeaturedProducts(list);
        }
      } catch (err) {
        console.error('Failed to load store products:', err);
      } finally {
        if (mounted) setLoadingProducts(false);
      }
    };
    loadProducts();
    return () => {
      mounted = false;
    };
  }, [selectedCategory]);

  // Fetch Live Mandi Rates
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

  const handleAddToCart = (product: CentralInventoryProduct) => {
    addStoreProduct(product, 1);
    setAddedProductId(product.id);
    setTimeout(() => {
      setAddedProductId(null);
    }, 1500);
  };

  const categories = [
    { id: 'ALL', label: language === 'ta' ? 'அனைத்தும்' : 'All Produce' },
    { id: 'VEGETABLES', label: language === 'ta' ? 'காய்கறிகள்' : 'Vegetables' },
    { id: 'FRUITS', label: language === 'ta' ? 'பழங்கள்' : 'Fruits' },
    { id: 'GREENS', label: language === 'ta' ? 'கீரைகள்' : 'Fresh Greens' },
    { id: 'GRAINS', label: language === 'ta' ? 'தானியங்கள்' : 'Grains & Rice' },
    { id: 'PULSES', label: language === 'ta' ? 'பருப்பு வகைகள்' : 'Pulses' },
  ];

  return (
    <div className="space-y-16 pb-16 bg-[#fcfdfc]">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-950 text-white">
        {/* Subtle Background Glow Circles */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Institutional Badge */}
          <div className="inline-flex items-center gap-2 bg-emerald-900/60 border border-emerald-500/40 rounded-full px-4 py-1.5 text-xs font-medium text-emerald-200 mb-6 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-semibold tracking-wide">
              {language === 'ta' ? 'உழவர் to உலகம்' : 'Ulavar2Ulagam'}
            </span>
            <span className="text-emerald-400/60">·</span>
            <span>
              {language === 'ta'
                ? 'விவசாயிகளிடமிருந்து உங்கள் குடும்பத்திற்கு நேரடியாக'
                : 'From Farmers to Your Family, Directly.'}
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
            Fresh From Farms.{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              Carefully Delivered
            </span>{' '}
            to Your Home.
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {language === 'ta'
              ? 'நாங்கள் உள்ளூர் விவசாயிகளிடமிருந்து நியாயமான விலையில் விளைபொருட்களை கொள்முதல் செய்து, தரம் பிரித்து, எங்கள் மத்திய சரக்ககத்திலிருந்து நேரடியாக உங்கள் வீடுகளுக்கு வழங்குகிறோம்.'
              : 'We partner with verified local farmers, procure harvest at fair agreed prices, quality-inspect every lot at our central hub, and deliver fresh produce directly to your doorstep.'}
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-3.5 max-w-xl mx-auto">
            <button
              onClick={() => onNavigate('buyer-marketplace')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 flex items-center justify-center gap-2 hover:-translate-y-0.5"
            >
              <ShoppingBag className="w-4 h-4 text-slate-950" />
              <span>{language === 'ta' ? 'பொருட்களை வாங்க (Shop Now)' : 'Shop Fresh Produce'}</span>
            </button>

            <button
              onClick={() => onNavigate('farmer-add-produce')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 transition flex items-center justify-center gap-2 backdrop-blur-md"
            >
              <Sprout className="w-4 h-4 text-emerald-400" />
              <span>{language === 'ta' ? 'விளைபொருள் விற்க (Farmer Submit)' : 'Submit Harvest as Farmer'}</span>
            </button>

            <button
              onClick={() => onNavigate('how-it-works')}
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl text-slate-300 hover:text-white font-medium text-sm transition flex items-center justify-center gap-1.5"
            >
              <span>{language === 'ta' ? 'செயல்முறை அறிய' : 'How It Works'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Core Trust Pillars */}
          <div className="mt-12 pt-10 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left max-w-4xl mx-auto">
            <div className="flex items-start gap-3 bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Central Inventory Quality</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  Every lot is cleaned, sorted, weighed, and graded at our Salem central hub before dispatch.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Fair Procurement Payout</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  Farmers receive guaranteed direct payouts with zero commission agents or auction deductions.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Dedicated Delivery Fleet</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  Safe doorstep delivery with live status tracking and customer delivery OTP verification.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. LIVE CENTRAL INVENTORY STOREFRONT PREVIEW */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Central Inventory Stock
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Fresh Daily Farm Produce
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Inspected, sorted, and packed at Ulavar2Ulagam Central Hub. Ready for instant dispatch.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        {loadingProducts ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200/80 p-4 animate-pulse space-y-3">
                <div className="w-full h-36 bg-slate-100 rounded-xl" />
                <div className="h-4 bg-slate-100 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
                <div className="h-8 bg-slate-100 rounded-xl" />
              </div>
            ))}
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 text-sm">
            No produce currently listed under this category.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredProducts.map((p) => {
              const isAdded = addedProductId === p.id;
              const inStock = p.stockQuantity > 0;
              const isLowStock = p.stockQuantity > 0 && p.stockQuantity <= (p.lowStockThreshold || 10);

              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition group flex flex-col justify-between"
                >
                  <div className="p-3">
                    {/* Image & Badges */}
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 mb-3">
                      <img
                        src={p.images?.[0] || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600'}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        loading="lazy"
                      />
                      {/* Quality Grade Badge */}
                      <span className="absolute top-2 left-2 bg-emerald-950/80 backdrop-blur-md text-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                        {p.qualityGrade || 'Grade A'}
                      </span>

                      {/* Origin Badge */}
                      {p.originLocation && (
                        <span className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-md text-slate-200 text-[10px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5 text-emerald-400" />
                          <span className="truncate max-w-[100px]">{p.originLocation}</span>
                        </span>
                      )}
                    </div>

                    {/* Category & Title */}
                    <div className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
                      {p.category}
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 line-clamp-1 mt-0.5">
                      {language === 'ta' && p.nameTamil ? p.nameTamil : p.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      {language === 'ta' ? p.name : p.nameTamil}
                    </p>

                    {/* Stock Status Indicator */}
                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      {inStock ? (
                        <span className={`font-medium ${isLowStock ? 'text-amber-600' : 'text-emerald-700'}`}>
                          ● {p.stockQuantity} {p.unit} in hub
                        </span>
                      ) : (
                        <span className="text-rose-600 font-medium">● Out of stock</span>
                      )}
                    </div>
                  </div>

                  {/* Price & Add to Cart Button */}
                  <div className="p-3 pt-0 border-t border-slate-100 flex items-center justify-between mt-2">
                    <div>
                      <div className="font-extrabold text-slate-900 text-base">
                        ₹{p.sellingPrice}
                        <span className="text-[11px] font-normal text-slate-500"> / {p.unit}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddToCart(p)}
                      disabled={!inStock}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm ${
                        !inStock
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : isAdded
                          ? 'bg-emerald-700 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* View All Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => onNavigate('buyer-marketplace')}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm px-6 py-3 rounded-xl border border-slate-200 shadow-sm transition"
          >
            <span>View All Produce in Central Store</span>
            <ArrowRight className="w-4 h-4 text-emerald-600" />
          </button>
        </div>
      </section>

      {/* 3. THE 4-STEP OPERATING MODEL */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs uppercase font-bold tracking-wider text-emerald-800">
            How Ulavar2Ulagam Works
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            The Direct Organized Supply Chain
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-1.5 leading-relaxed">
            Eliminating 4-tier commission middlemen. We procure directly from producers, manage central hub inventory, and deliver verified fresh food.
          </p>
        </div>

        {/* 4 Stage Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-emerald-300 transition">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm mb-3">
              01
            </div>
            <h3 className="font-bold text-sm text-slate-900">Farmer Produce Submission</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Farmers submit produce details, expected prices, harvest dates, and crop photos via the portal or voice assistant.
            </p>
            <div className="mt-3 text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
              <span>Fair agreed payout</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-emerald-300 transition">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm mb-3">
              02
            </div>
            <h3 className="font-bold text-sm text-slate-900">Hub QC & Procurement</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Ulavar2Ulagam administrators review submissions, inspect quality grade (A/B), and execute purchase intake at guaranteed rates.
            </p>
            <div className="mt-3 text-[11px] font-semibold text-indigo-700 flex items-center gap-1">
              <span>Immediate farmer credit</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-emerald-300 transition">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-sm mb-3">
              03
            </div>
            <h3 className="font-bold text-sm text-slate-900">Central Inventory Listing</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Approved stock enters Central Inventory with real-time weights and transparent retail pricing for family households.
            </p>
            <div className="mt-3 text-[11px] font-semibold text-amber-700 flex items-center gap-1">
              <span>Real-time stock tracking</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-emerald-300 transition">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm mb-3">
              04
            </div>
            <h3 className="font-bold text-sm text-slate-900">Doorstep Delivery with OTP</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Orders are packed and assigned to dedicated delivery partners who verify fulfillment with customer OTP upon handover.
            </p>
            <div className="mt-3 text-[11px] font-semibold text-teal-700 flex items-center gap-1">
              <span>Live status tracking</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </section>

      {/* 4. DAILY LIVE MANDI BENCHMARK WIDGET */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
          {/* Header & Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Daily APMC Mandi Comparison
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                Market Rates vs Ulavar2Ulagam Procurement
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Official Government APMC mandi benchmark vs Ulavar2Ulagam direct farmer procurement payout
              </p>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-2.5">
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

              <div className="relative">
                <input
                  type="text"
                  placeholder="Search vegetable / காய்..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-50 text-slate-800 text-xs px-3 py-2 pl-8 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-40 sm:w-52"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>

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
            <div className="py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 bg-slate-50/70 px-4 rounded-xl mt-4">
              <div>
                APMC Market: <strong className="text-slate-800">{summaryMeta.mandiName}</strong> · Date: <span className="text-slate-700">{summaryMeta.date}</span>
              </div>
              <div>
                Arrival Volume: <strong className="text-slate-800">{summaryMeta.totalArrival.toLocaleString()} Quintals</strong>
              </div>
            </div>
          )}

          {/* Rates Table */}
          <div className="mt-5 overflow-x-auto">
            {loadingRates && ratesData.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-xs">
                Loading official market benchmark rates...
              </div>
            ) : ratesData.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-xs">
                No items found matching "{searchQuery}".
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Produce</th>
                    <th className="py-2.5 px-3">Mandi Benchmark</th>
                    <th className="py-2.5 px-3">Price Range</th>
                    <th className="py-2.5 px-3">24h Trend</th>
                    <th className="py-2.5 px-3 bg-emerald-50/60 rounded-t-lg">
                      <span className="text-emerald-900 font-bold">Ulavar2Ulagam Payout</span>
                    </th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {ratesData.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0"
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

                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">₹{item.modalPrice} <span className="text-[10px] font-normal text-slate-500">/ kg</span></div>
                        <div className="text-[10px] text-slate-400">APMC Modal</div>
                      </td>

                      <td className="py-3 px-3 text-slate-600 font-medium">
                        ₹{item.minPrice} - ₹{item.maxPrice} / kg
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 font-semibold text-xs px-2 py-0.5 rounded-md ${
                            item.isRising
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : 'bg-rose-50 text-rose-700 border border-rose-100'
                          }`}
                        >
                          {item.isRising ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {item.trendPercentage > 0 ? `+${item.trendPercentage}%` : `${item.trendPercentage}%`}
                        </span>
                      </td>

                      <td className="py-3 px-3 bg-emerald-50/40">
                        <div className="font-bold text-emerald-800 text-sm">
                          ₹{item.kisanDirectPrice} <span className="text-[10px] font-normal text-emerald-700">/ kg</span>
                        </div>
                        <div className="text-[10px] text-emerald-600 font-medium">
                          +₹{item.farmerBenefitPerKg}/kg direct gain
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => onNavigate('farmer-add-produce')}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold px-3 py-1.5 rounded-lg transition"
                        >
                          Sell at this rate
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

      {/* 5. IMPACT & TRUST HIGHLIGHTS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400">+18.5%</div>
              <div className="text-xs text-slate-300 font-medium mt-1">Average Farmer Realization</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Over local commission agent deductions</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white">24 Hours</div>
              <div className="text-xs text-slate-300 font-medium mt-1">Harvest to Central Hub Intake</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Peak nutritional freshness preserved</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400">0% Comm</div>
              <div className="text-xs text-slate-300 font-medium mt-1">Zero Middlemen Commission</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Transparent digital weighing & receipts</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white">100% OTP</div>
              <div className="text-xs text-slate-300 font-medium mt-1">Verified Delivery Security</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Assigned delivery fleet handover</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
