import React, { useEffect, useState, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import api from '../../services/api';
import { ProduceBatch, Product } from '../../types';
import FreshnessBadge from '../../components/common/FreshnessBadge';
import ProductDetailPage from './ProductDetailPage';
import CheckoutModal, { DirectCheckoutItem } from './CheckoutModal';
import {
  Search,
  SlidersHorizontal,
  Star,
  MapPin,
  ShieldCheck,
  Plus,
  Minus,
  ShoppingCart,
  Send,
  Sparkles,
  Layers,
  ArrowRight,
  TrendingDown,
  X,
  Check,
  Zap,
} from 'lucide-react';

interface MarketplaceProps {
  onNavigate: (view: string, params?: any) => void;
}

export const Marketplace: React.FC<MarketplaceProps> = ({ onNavigate }) => {
  const { language, t } = useLanguage();
  const { cartItems, addToCart, updateQuantity, openCart } = useCart();

  const [batches, setBatches] = useState<ProduceBatch[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedGrade, setSelectedGrade] = useState<string>('ALL');
  const [selectedFreshness, setSelectedFreshness] = useState<string>('ALL');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('BEST_MATCH');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Modals
  const [activeDetailBatch, setActiveDetailBatch] = useState<ProduceBatch | null>(null);
  const [directCheckoutItem, setDirectCheckoutItem] = useState<DirectCheckoutItem | null>(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  // Offer Modal State (for commercial wholesale negotiations)
  const [selectedBatchForOffer, setSelectedBatchForOffer] = useState<ProduceBatch | null>(null);
  const [offerPrice, setOfferPrice] = useState('22');
  const [offerQuantity, setOfferQuantity] = useState('100');
  const [offerNotes, setOfferNotes] = useState('');
  const [submittingOffer, setSubmittingOffer] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadCatalog();
  }, []);

  useEffect(() => {
    loadProduce();
  }, [selectedGrade, selectedFreshness, maxPrice, sortBy]);

  const loadCatalog = async () => {
    try {
      const prods = await api.getFarmerProducts();
      setProducts(prods);
    } catch (e) {
      console.error(e);
    }
  };

  const loadProduce = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (selectedGrade !== 'ALL') filters.grade = selectedGrade;
      if (selectedFreshness !== 'ALL') filters.freshness = selectedFreshness;
      if (maxPrice) filters.maxPrice = maxPrice;
      filters.sortBy = sortBy;

      const res = await api.getMarketplaceProduce(filters);
      setBatches(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filter batches locally by search query and category
  const filteredBatches = useMemo(() => {
    return batches.filter((batch) => {
      // Category filter
      if (selectedCategory === 'URGENT' && batch.freshnessStatus !== 'URGENT') return false;
      if (selectedCategory === 'FRESH' && batch.freshnessStatus !== 'FRESH') return false;

      // Search query (handles English, Tamil, and Latin Tamil)
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const engName = (batch.product?.name || '').toLowerCase();
      const tamName = (batch.product?.nameTamil || '').toLowerCase();
      const code = (batch.batchCode || '').toLowerCase();
      const village = (batch.village || '').toLowerCase();
      const farmerName = (batch.farmer?.user?.name || '').toLowerCase();

      return (
        engName.includes(q) ||
        tamName.includes(q) ||
        code.includes(q) ||
        village.includes(q) ||
        farmerName.includes(q)
      );
    });
  }, [batches, searchQuery, selectedCategory]);

  const handleSendOffer = async () => {
    if (!selectedBatchForOffer) return;
    try {
      setSubmittingOffer(true);
      const demands = await api.getBuyerDemands();
      const targetDemand = demands[0];

      if (!targetDemand) {
        showToast(
          language === 'ta'
            ? 'விலை பேரம் பேசுவதற்கு முன் ஒரு தேவையை பதிவு செய்யவும்'
            : 'Please post a demand first to negotiate bulk offers.'
        );
        onNavigate('buyer-post-demand');
        return;
      }

      await api.sendBuyerOffer(targetDemand.id, {
        batchId: selectedBatchForOffer.id,
        farmerId: selectedBatchForOffer.farmerId,
        offeredPricePerKg: parseFloat(offerPrice),
        quantity: parseFloat(offerQuantity),
        notes: offerNotes || 'Wholesale offer from KisanDirect marketplace',
      });

      showToast(
        language === 'ta'
          ? `விவசாயிக்கு ₹${offerPrice}/கிலோ (${offerQuantity} கிலோ) விலை விருப்பம் அனுப்பப்பட்டது!`
          : `Offer of ₹${offerPrice}/kg for ${offerQuantity}kg sent to farmer!`
      );
      setSelectedBatchForOffer(null);
    } catch (err: any) {
      alert(err.message || 'Failed to send offer');
    } finally {
      setSubmittingOffer(false);
    }
  };

  // Direct "Buy Now" handler from Detail Modal
  const handleBuyNow = (batch: any, qty: number) => {
    setActiveDetailBatch(null);
    setDirectCheckoutItem({
      batchId: batch.id,
      quantity: qty,
      title: language === 'ta' ? batch.product?.nameTamil : batch.product?.name,
      pricePerUnit: batch.pricePerKg,
      unit: 'kg',
      imageUrl: batch.imageUrl || batch.product?.imageUrl,
      farmerName: batch.farmer?.user?.name,
    });
    setIsCheckoutModalOpen(true);
  };

  // Categories list
  const categories = [
    { id: 'ALL', labelEn: 'All Fresh', labelTa: 'அனைத்தும்' },
    { id: 'FRESH', labelEn: 'Morning Harvest', labelTa: 'இன்றைய அறுவடை' },
    { id: 'URGENT', labelEn: '⚡ Flash Deals', labelTa: '⚡ விரைவு தள்ளுபடி' },
    { id: 'VEG', labelEn: 'Vegetables', labelTa: 'காய்கறிகள்' },
    { id: 'FRUIT', labelEn: 'Fruits', labelTa: 'பழங்கள்' },
    { id: 'GREENS', labelEn: 'Greens', labelTa: 'கீரைகள்' },
  ];

  // Active filter counter
  const activeFiltersCount =
    (selectedGrade !== 'ALL' ? 1 : 0) +
    (selectedFreshness !== 'ALL' ? 1 : 0) +
    (maxPrice ? 1 : 0) +
    (sortBy !== 'BEST_MATCH' ? 1 : 0);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24 sm:pb-12">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-800 text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <Check className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sticky App-Style Header & Search Bar */}
      <div className="sticky top-14 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 py-2.5 shadow-sm space-y-2.5">
        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === 'ta'
                  ? 'தக்காளி, வெங்காயம், உருளை அல்லது விவசாயி...'
                  : 'Search tomato, onion, Salem farmers...'
              }
              className="w-full pl-9 pr-8 py-2 bg-slate-100 hover:bg-slate-150 focus:bg-white rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className={`h-9 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition relative ${
              activeFiltersCount > 0
                ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">
              {language === 'ta' ? 'வடிகட்டி' : 'Filter'}
            </span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Horizontal Category Carousel */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar text-xs">
          {categories.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition text-xs shrink-0 ${
                  active
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {language === 'ta' ? cat.labelTa : cat.labelEn}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
        {/* Collective Bulk Purchasing Banner (Mode 2 Promotion) */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 rounded-2xl p-4 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {language === 'ta' ? 'மொத்தக் கொள்முதல்' : 'Mode 2: Bulk Pool'}
                </span>
                <span className="text-[11px] text-emerald-200">
                  {language === 'ta' ? '500+ கிலோ தேவைப்படுகிறதா?' : 'Need 500kg+ for restaurant/hostel?'}
                </span>
              </div>
              <h3 className="font-extrabold text-xs sm:text-sm mt-0.5 text-white">
                {language === 'ta'
                  ? 'தேவையை பதிவிட்டு 10+ விவசாயிகளிடமிருந்து ஒரே லாரியில் பெறுங்கள்'
                  : 'Post Requirement to Automatically Pool Supply from Multiple Farmers'}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => onNavigate('buyer-post-demand')}
              className="flex-1 sm:flex-initial px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-98"
            >
              <span>{language === 'ta' ? 'தேவையை பதிவு செய்' : 'Post Demand'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('buyer-matches')}
              className="flex-1 sm:flex-initial px-3 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition whitespace-nowrap"
            >
              {language === 'ta' ? 'கூட்டு ஒப்பந்தங்கள்' : 'Smart Pools'}
            </button>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>
            {language === 'ta' ? 'கிடைக்கும் விளைபொருட்கள்' : 'Available Harvests'}:{' '}
            <strong className="text-slate-800 font-bold">{filteredBatches.length}</strong>
          </span>
          <div className="flex items-center gap-1">
            <span className="hidden sm:inline">{language === 'ta' ? 'வரிசைப்படுத்து:' : 'Sort:'}</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-semibold outline-none text-xs"
            >
              <option value="BEST_MATCH">{language === 'ta' ? 'சிறந்த பொருத்தம்' : 'Best Match'}</option>
              <option value="NEAREST">{language === 'ta' ? 'அருகிலுள்ள தூரம்' : 'Nearest Farm'}</option>
              <option value="PRICE_ASC">{language === 'ta' ? 'குறைந்த விலை' : 'Lowest Price'}</option>
              <option value="FRESHEST">{language === 'ta' ? 'புதிய அறுவடை' : 'Freshest'}</option>
            </select>
          </div>
        </div>

        {/* Product Cards Grid */}
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500 font-medium">
              {language === 'ta' ? 'விளைபொருட்கள் பெறப்படுகின்றன...' : 'Fetching fresh farmer batches...'}
            </p>
          </div>
        ) : filteredBatches.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm max-w-md mx-auto my-8 space-y-3">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-800">
              {language === 'ta' ? 'பொருட்கள் எதுவும் கிடைக்கவில்லை' : 'No Produce Matches Your Search'}
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'ta'
                ? 'வடிகட்டிகளை மாற்றவும் அல்லது புதிய தேவையை பதிவு செய்யவும்.'
                : 'Try adjusting filters or post a demand for local farmers to fulfill.'}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
                setSelectedGrade('ALL');
                setSelectedFreshness('ALL');
                setMaxPrice('');
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition"
            >
              {language === 'ta' ? 'வடிகட்டிகளை மீட்டமை' : 'Reset All Filters'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredBatches.map((batch) => {
              const productName = language === 'ta' ? batch.product?.nameTamil : batch.product?.name;
              const farmerName = batch.farmer?.user?.name || (language === 'ta' ? 'விவசாயி' : 'Farmer');
              const village = batch.village || 'Salem';
              const rating = batch.farmer?.rating || 4.8;
              const distance = batch.distanceKm ? `${batch.distanceKm} km` : '4.8 km';
              const itemInCart = cartItems.find((ci) => ci.batchId === batch.id);

              return (
                <div
                  key={batch.id}
                  className="bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-300 shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden group"
                >
                  {/* Card Top: Image & Status Badges */}
                  <div
                    className="cursor-pointer relative"
                    onClick={() => setActiveDetailBatch(batch)}
                  >
                    <div className="h-36 sm:h-40 bg-slate-100 overflow-hidden relative">
                      <img
                        src={
                          batch.imageUrl ||
                          batch.product?.imageUrl ||
                          'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400'
                        }
                        alt={productName}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        loading="lazy"
                      />

                      {/* Freshness Badge Floating */}
                      <div className="absolute top-2 left-2">
                        <FreshnessBadge
                          status={batch.freshnessStatus}
                          remainingText={batch.freshness?.formattedRemaining}
                        />
                      </div>

                      {/* Grade Pill */}
                      <span className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                        {language === 'ta' ? `தரம் ${batch.qualityGrade}` : `Grade ${batch.qualityGrade}`}
                      </span>

                      {/* Stock Pill at Bottom Left */}
                      <span className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-xs text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                        {batch.quantity} kg {language === 'ta' ? 'இருப்பு' : 'left'}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                    <div
                      className="cursor-pointer"
                      onClick={() => setActiveDetailBatch(batch)}
                    >
                      {/* Crop Name */}
                      <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 line-clamp-1 group-hover:text-emerald-700 transition">
                        {productName}
                      </h3>

                      {/* Farmer Trust Pill */}
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                        <span className="truncate flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span className="truncate font-medium">{farmerName}</span>
                        </span>
                        <span className="flex items-center gap-0.5 font-bold text-amber-600 shrink-0">
                          <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                          <span>{rating}</span>
                        </span>
                      </div>

                      {/* Location & Distance */}
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                        <MapPin className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">{village} • {distance}</span>
                      </div>
                    </div>

                    {/* Price & Action Section */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm sm:text-base font-black text-emerald-700">
                            ₹{batch.pricePerKg}
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal">/kg</span>
                        </div>
                        <span className="text-[9px] text-emerald-600 font-semibold block leading-none">
                          {language === 'ta' ? 'இடைத்தரகர் இல்லை' : 'Direct Farm'}
                        </span>
                      </div>

                      {/* Add to Cart Stepper / Button */}
                      {itemInCart ? (
                        <div className="flex items-center border border-emerald-600 bg-emerald-50 rounded-xl overflow-hidden shadow-xs">
                          <button
                            onClick={() => {
                              if (itemInCart.quantity > 1) {
                                updateQuantity(itemInCart.id, itemInCart.quantity - 1);
                              }
                            }}
                            className="w-7 h-7 flex items-center justify-center text-emerald-700 hover:bg-emerald-100 active:bg-emerald-200 transition"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 font-bold text-xs text-emerald-900">
                            {itemInCart.quantity}
                          </span>
                          <button
                            onClick={() => {
                              if (itemInCart.quantity < batch.quantity) {
                                updateQuantity(itemInCart.id, itemInCart.quantity + 1);
                              }
                            }}
                            className="w-7 h-7 flex items-center justify-center text-emerald-700 hover:bg-emerald-100 active:bg-emerald-200 transition"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            addToCart(batch.id, Math.min(5, batch.quantity));
                            showToast(
                              language === 'ta'
                                ? `${productName} கூடையில் சேர்க்கப்பட்டது!`
                                : `${productName} added to cart!`
                            );
                          }}
                          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1 active:scale-95 shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{language === 'ta' ? 'சேர்' : 'Add'}</span>
                        </button>
                      )}
                    </div>

                    {/* Secondary Action: Bulk Negotiate Offer */}
                    <button
                      onClick={() => {
                        setSelectedBatchForOffer(batch);
                        setOfferPrice(String(batch.pricePerKg));
                        setOfferQuantity(String(Math.min(batch.quantity, 100)));
                      }}
                      className="w-full py-1 text-[10px] font-bold text-slate-500 hover:text-emerald-700 hover:bg-slate-50 rounded-lg transition text-center"
                    >
                      {language === 'ta' ? '🤝 மொத்த விலை பேரம்' : '🤝 Bulk Wholesale Offer'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Slide-Up Mobile Filter Drawer */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100 animate-in slide-in-from-bottom-6 duration-200">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-emerald-700" />
                <h3 className="font-extrabold text-sm text-slate-900">
                  {language === 'ta' ? 'வடிகட்டிகள்' : 'Filter Produce'}
                </h3>
              </div>
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-200 text-slate-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4 overflow-y-auto">
              {/* Quality Grade */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {language === 'ta' ? 'தர நிலை' : 'Quality Grade'}
                </label>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  {['ALL', 'A', 'B', 'C'].map((g) => (
                    <button
                      key={g}
                      onClick={() => setSelectedGrade(g)}
                      className={`py-2 rounded-xl font-bold border transition text-center ${
                        selectedGrade === g
                          ? 'bg-emerald-700 text-white border-emerald-700'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {g === 'ALL' ? (language === 'ta' ? 'அனைத்தும்' : 'All') : `Grade ${g}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Freshness Level */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {language === 'ta' ? 'புத்துணர்ச்சி நிலை' : 'Freshness Status'}
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    { id: 'ALL', labelEn: 'All', labelTa: 'அனைத்தும்' },
                    { id: 'FRESH', labelEn: 'Fresh Harvest', labelTa: 'புதிய அறுவடை' },
                    { id: 'URGENT', labelEn: 'Urgent Deals', labelTa: 'விரைவு விற்பனை' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFreshness(f.id)}
                      className={`py-2 rounded-xl font-bold border transition text-center ${
                        selectedFreshness === f.id
                          ? 'bg-emerald-700 text-white border-emerald-700'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {language === 'ta' ? f.labelTa : f.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Max Price */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                  <span>{language === 'ta' ? 'அதிகபட்ச விலை / கிலோ' : 'Max Price / kg'}</span>
                  <span className="text-emerald-700">{maxPrice ? `₹${maxPrice}` : 'Any'}</span>
                </div>
                <div className="flex items-center gap-2">
                  {['', '30', '50', '80', '120'].map((p) => (
                    <button
                      key={p}
                      onClick={() => setMaxPrice(p)}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold ${
                        maxPrice === p
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      {p === '' ? (language === 'ta' ? 'எதுவும்' : 'Any') : `₹${p}`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-slate-100 flex items-center gap-2 bg-white">
              <button
                onClick={() => {
                  setSelectedGrade('ALL');
                  setSelectedFreshness('ALL');
                  setMaxPrice('');
                  setSortBy('BEST_MATCH');
                }}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                {language === 'ta' ? 'மீட்டமை' : 'Reset'}
              </button>
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm transition"
              >
                {language === 'ta' ? 'பயன்படுத்து' : 'Apply Filters'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Produce Detail Modal */}
      {activeDetailBatch && (
        <ProductDetailPage
          batch={activeDetailBatch}
          onClose={() => setActiveDetailBatch(null)}
          onBuyNow={handleBuyNow}
        />
      )}

      {/* Checkout Modal (Direct 1-Page Purchase) */}
      {isCheckoutModalOpen && (
        <CheckoutModal
          isOpen={isCheckoutModalOpen}
          onClose={() => {
            setIsCheckoutModalOpen(false);
            setDirectCheckoutItem(null);
          }}
          directItem={directCheckoutItem}
          onOrderSuccess={(orderId) => {
            showToast(t('orderPlacedSuccess'));
            onNavigate('buyer-orders', { orderId });
          }}
        />
      )}

      {/* Wholesale Offer Negotiation Modal */}
      {selectedBatchForOffer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-900">
                {language === 'ta' ? 'விவசாயியிடம் விலை பேரம் பேசுதல்' : 'Negotiate Wholesale Offer'}
              </h3>
              <button
                onClick={() => setSelectedBatchForOffer(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
              <div className="font-bold text-slate-900">
                {language === 'ta' ? selectedBatchForOffer.product?.nameTamil : selectedBatchForOffer.product?.name}
              </div>
              <div className="text-slate-500 mt-0.5">
                {language === 'ta' ? 'விவசாயி' : 'Farmer'}: {selectedBatchForOffer.farmer?.user?.name} ({selectedBatchForOffer.village})
              </div>
              <div className="text-emerald-700 font-bold mt-1">
                {language === 'ta' ? 'பட்டியல் விலை' : 'Listed Price'}: ₹{selectedBatchForOffer.pricePerKg}/kg · {language === 'ta' ? 'இருப்பு' : 'Available'}: {selectedBatchForOffer.quantity} kg
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'ta' ? 'தேவை அளவு (கிலோ)' : 'Quantity (kg)'}
                </label>
                <input
                  type="number"
                  max={selectedBatchForOffer.quantity}
                  value={offerQuantity}
                  onChange={(e) => setOfferQuantity(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 outline-none font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'ta' ? 'விருப்ப விலை / கிலோ (₹)' : 'Offer Price / kg (₹)'}
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 outline-none font-bold text-emerald-800"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedBatchForOffer(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                {language === 'ta' ? 'ரத்து' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleSendOffer}
                disabled={submittingOffer}
                className="flex-1 py-2 text-xs font-bold bg-emerald-700 text-white rounded-xl shadow hover:bg-emerald-800 transition"
              >
                {submittingOffer ? (language === 'ta' ? 'அனுப்பப்படுகிறது...' : 'Sending...') : (language === 'ta' ? 'விருப்பம் அனுப்பு' : 'Submit Offer')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
