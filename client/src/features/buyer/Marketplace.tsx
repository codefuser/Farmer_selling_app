import React, { useEffect, useState, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { useRealtime } from '../../context/RealtimeContext';
import api from '../../services/api';
import { CentralInventoryProduct } from '../../types';
import CheckoutModal, { DirectCheckoutItem } from './CheckoutModal';
import {
  Search,
  ShoppingCart,
  MapPin,
  ShieldCheck,
  Plus,
  Minus,
  Sparkles,
  Check,
  Sprout,
  ArrowRight,
  Filter,
  CheckCircle2,
  Clock,
  Zap,
  Star,
  ChevronRight,
  Truck,
  RotateCcw,
  SlidersHorizontal,
  X,
  TrendingDown,
  ShoppingBag,
} from 'lucide-react';

interface MarketplaceProps {
  onNavigate: (view: string, params?: any) => void;
}

export const Marketplace: React.FC<MarketplaceProps> = ({ onNavigate }) => {
  const { language, t } = useLanguage();
  const { cartItems, addStoreProduct, updateQuantity, openCart, cartCount } = useCart();
  const { subscribe, isConnected } = useRealtime();

  const [products, setProducts] = useState<CentralInventoryProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('RECOMMENDED');

  // Checkout modal
  const [directCheckoutItem, setDirectCheckoutItem] = useState<DirectCheckoutItem | null>(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  // Active Promo Banner Slide
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);

  const banners = [
    {
      id: 1,
      badge: language === 'ta' ? 'அதிகாலை அறுவடை' : 'Morning Farm Harvest',
      title: language === 'ta' ? 'விவசாயிகளிடமிருந்து நேரடியாக உங்கள் குடும்பத்திற்கு' : 'From Farmers to Your Family, Directly',
      desc: language === 'ta' ? 'இடைத்தரகர்கள் இன்றி, நியாயமான விலையில் தூய விளைபொருட்கள்.' : 'Zero middlemen. 100% lab-verified freshness dispatched from Salem Central Hub.',
      color: 'from-emerald-900 via-emerald-800 to-teal-900',
      tag: '⚡ Same Day Dispatch',
    },
    {
      id: 2,
      badge: language === 'ta' ? '100% தரம் சரிபார்க்கப்பட்டது' : '100% Quality Inspected',
      title: language === 'ta' ? 'காய்கறிகள் & பழங்கள் சிறந்த தர வரிசையுடன்' : 'Graded Vegetables & Fruits at Fair Prices',
      desc: language === 'ta' ? 'எடை துல்லியமாக அளக்கப்பட்டு வீடுகளுக்கு பாதுகாப்பாக விநியோகம்.' : 'Accurately weighed, cleaned and hygienically packed for your kitchen.',
      color: 'from-green-950 via-emerald-900 to-cyan-950',
      tag: '🛡️ Lab Verified Freshness',
    },
    {
      id: 3,
      badge: language === 'ta' ? 'நேரடி சேலம் கொள்முதல்' : 'Salem Hub Direct',
      title: language === 'ta' ? 'விவசாயிகளுக்கு நியாய விலை, உங்களுக்கு உன்னத நலம்' : 'Empowering Farmers, Enriching Families',
      desc: language === 'ta' ? 'உங்கள் ஆர்டரை உறுதி செய்து OTP மூலம் பாதுகாப்பாக பெற்றுக்கொள்ளுங்கள்.' : 'Track your fresh delivery with real-time OTP confirmation.',
      color: 'from-teal-950 via-emerald-900 to-slate-900',
      tag: '📍 Salem Central Corridor',
    },
  ];

  // Auto-cycle promotional banners
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBannerIdx((prev) => (prev + 1) % banners.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [banners.length]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadProducts = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const categoryParam = selectedCategory === 'ALL' ? undefined : selectedCategory;
      const res = await api.getStoreProducts({
        category: categoryParam,
        search: searchQuery.trim() || undefined,
        sort: sortBy,
      });

      if (res) {
        const list = Array.isArray(res) ? res : (res as any).products || [];
        setProducts(list);
      }
    } catch (err) {
      console.error('Failed to load store products:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts(true);
  }, [selectedCategory, sortBy]);

  // Real-time Database Updates Subscription (Auto-sync without page refresh)
  useEffect(() => {
    const unsubInventory = subscribe('inventory_update', (data: any) => {
      console.log('⚡ Real-time inventory event received:', data);
      loadProducts(false);
      showToast(
        language === 'ta'
          ? 'மத்திய சரக்கக இருப்பு நேரலையில் புதுப்பிக்கப்பட்டது'
          : 'Central Hub inventory updated in real-time'
      );
    });

    const unsubProductUpdated = subscribe('product_updated', (product: any) => {
      console.log('⚡ Real-time product_updated event:', product);
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, ...product } : p))
      );
    });

    const unsubProductAdded = subscribe('product_added', (newProduct: any) => {
      console.log('⚡ Real-time product_added event:', newProduct);
      setProducts((prev) => [newProduct, ...prev.filter((p) => p.id !== newProduct.id)]);
      showToast(
        language === 'ta'
          ? `புதிய விளைபொருள் சேர்க்கப்பட்டது: ${newProduct.nameTamil || newProduct.name}`
          : `New produce listed: ${newProduct.name}`
      );
    });

    const unsubProductDeleted = subscribe('product_deleted', (payload: any) => {
      console.log('⚡ Real-time product_deleted event:', payload);
      setProducts((prev) => prev.filter((p) => p.id !== payload.productId));
    });

    return () => {
      unsubInventory();
      unsubProductUpdated();
      unsubProductAdded();
      unsubProductDeleted();
    };
  }, [subscribe, language]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadProducts(true);
  };

  const handleAddToCart = (product: CentralInventoryProduct, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    addStoreProduct(product, 1);
    setJustAddedId(product.id);
    showToast(
      language === 'ta'
        ? `${product.nameTamil || product.name} கூடையில் சேர்க்கப்பட்டது`
        : `Added 1 ${product.unit} of ${product.name} to cart`
    );
    setTimeout(() => setJustAddedId(null), 1500);
  };

  const handleBuyNow = (product: CentralInventoryProduct, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDirectCheckoutItem({
      productId: product.id,
      quantity: 1,
      title: language === 'ta' && product.nameTamil ? product.nameTamil : product.name,
      pricePerUnit: product.sellingPrice,
      unit: product.unit || 'kg',
      imageUrl: product.imageUrl || product.images?.[0] || '',
      farmerName: 'Ulavar2Ulagam Central Hub',
      village: 'Salem Central Procurement Hub',
      district: 'Salem',
    });
    setIsCheckoutModalOpen(true);
  };

  // Filter local items if InStock toggle active
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (onlyInStock && p.stockQuantity <= 0) return false;
      return true;
    });
  }, [products, onlyInStock]);

  const categories = [
    { id: 'ALL', icon: '🛒', labelEn: 'All Produce', labelTa: 'அனைத்தும்' },
    { id: 'VEGETABLES', icon: '🍅', labelEn: 'Vegetables', labelTa: 'காய்கறிகள்' },
    { id: 'FRUITS', icon: '🥭', labelEn: 'Fruits', labelTa: 'பழங்கள்' },
    { id: 'GREENS', icon: '🥬', labelEn: 'Farm Greens', labelTa: 'கீரைகள்' },
    { id: 'GRAINS', icon: '🌾', labelEn: 'Grains & Rice', labelTa: 'தானியங்கள்' },
    { id: 'PULSES', icon: '🫘', labelEn: 'Pulses & Dal', labelTa: 'பருப்பு' },
    { id: 'SEASONAL', icon: '🥥', labelEn: 'Seasonal', labelTa: 'பருவகாலம்' },
  ];

  // Helper to find quantity of item in current cart
  const getItemCartQty = (productId: string) => {
    const item = cartItems.find((c) => c.productId === productId);
    return item ? item.quantity : 0;
  };

  return (
    <div className="min-h-screen bg-[#f7f9fa] pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 bg-slate-900/95 backdrop-blur-md text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center gap-2.5 animate-in fade-in slide-in-from-top-3">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Flipkart / Amazon App Top Navigation Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 space-y-2.5">
          {/* Row 1: Delivery Location & Real-Time Sync Indicator */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-700">
              <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span className="text-slate-500">{language === 'ta' ? 'விநியோகம்:' : 'Deliver to:'}</span>
              <span className="font-bold text-slate-900">Salem 636001</span>
              <span className="hidden sm:inline text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                ⚡ Express Delivery Today
              </span>
            </div>

            {/* Live SSE Pulse */}
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-emerald-200">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="hidden xs:inline">
                {isConnected ? 'Central Hub Live' : 'Connecting Hub...'}
              </span>
            </div>
          </div>

          {/* Row 2: Amazon/Flipkart Search Bar with Quick Cart */}
          <div className="flex items-center gap-2 sm:gap-3">
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <input
                type="text"
                placeholder={
                  language === 'ta'
                    ? 'புதிய தக்காளி, வெங்காயம், அரிசி, பருப்பு தேடவும்...'
                    : 'Search fresh tomatoes, shallots, carrots, greens, rice...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-900 text-xs sm:text-sm px-4 py-2.5 pl-10 pr-9 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    loadProducts(true);
                  }}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>

            <button
              onClick={() => loadProducts(true)}
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-sm transition shrink-0"
            >
              {language === 'ta' ? 'தேடு' : 'Search'}
            </button>

            {/* Cart Shortcut with Badge */}
            <button
              onClick={openCart}
              className="relative flex items-center justify-center p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-2xl border border-emerald-200 transition shrink-0"
              title="Open Cart"
            >
              <ShoppingCart className="w-5 h-5 text-emerald-800" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-in zoom-in">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Category Bubbles Horizontal Carousel (Flipkart Style) */}
        <div className="border-t border-slate-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 overflow-x-auto no-scrollbar flex items-center gap-2 sm:gap-4">
            {categories.map((c) => {
              const isSelected = selectedCategory === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                    isSelected
                      ? 'bg-emerald-700 text-white shadow-sm scale-105'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
                  }`}
                >
                  <span className="text-sm">{c.icon}</span>
                  <span>{language === 'ta' ? c.labelTa : c.labelEn}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-6">
        {/* Flipkart / Amazon Style Promotional Banner Carousel */}
        <div className="relative rounded-3xl overflow-hidden shadow-lg border border-emerald-950/20">
          <div
            className={`bg-gradient-to-r ${banners[activeBannerIdx].color} text-white p-6 sm:p-8 transition-all duration-700 relative`}
          >
            <div className="max-w-2xl relative z-10 space-y-2">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-emerald-300 border border-white/20">
                <span>{banners[activeBannerIdx].tag}</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight leading-snug">
                {banners[activeBannerIdx].title}
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-xl">
                {banners[activeBannerIdx].desc}
              </p>
            </div>

            {/* Banner Dot Indicators */}
            <div className="absolute bottom-3 right-4 flex items-center gap-1.5 z-10">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveBannerIdx(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === activeBannerIdx ? 'w-6 bg-white' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Filter and Count Controls Strip */}
        <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
            <span className="text-slate-900 font-bold">
              {filteredProducts.length} {language === 'ta' ? 'பொருட்கள் கிடைக்கின்றன' : 'Products Available'}
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-emerald-700">
              {selectedCategory === 'ALL'
                ? 'All Categories'
                : categories.find((c) => c.id === selectedCategory)?.labelEn}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <label className="flex items-center gap-1.5 text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
              />
              <span className="font-medium text-slate-800">
                {language === 'ta' ? 'இருப்பில் உள்ளவை மட்டும்' : 'In Stock Only'}
              </span>
            </label>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              <option value="RECOMMENDED">Featured / Recommended</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="stock_desc">Highest Stock First</option>
            </select>
          </div>
        </div>

        {/* Product Catalog Grid (Flipkart / Amazon Mobile & Desktop Layout) */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 space-y-3 animate-pulse">
                <div className="w-full aspect-square bg-slate-100 rounded-xl" />
                <div className="h-4 bg-slate-100 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
                <div className="h-8 bg-slate-100 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
            <Sprout className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-base text-slate-800">
              {language === 'ta' ? 'பொருட்கள் எதுவும் கிடைக்கவில்லை' : 'No Produce Found'}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {language === 'ta'
                ? 'உங்கள் தேடலை மாற்றி அல்லது பிற வகையைத் தேர்ந்தெடுத்து முயற்சிக்கவும்.'
                : 'Try adjusting your search query, selecting another category, or unchecking "In Stock Only".'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {filteredProducts.map((p) => {
              const inStock = p.stockQuantity > 0;
              const isLowStock = p.stockQuantity > 0 && p.stockQuantity <= (p.lowStockThreshold || 20);
              const isJustAdded = justAddedId === p.id;
              const cartQty = getItemCartQty(p.id);

              // Guaranteed accurate product image fallback
              const imgUrl =
                p.imageUrl ||
                (p as any).images?.[0] ||
                'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600';

              // Calculated savings vs typical reference market price
              const mrp = p.referenceMaxPrice > p.sellingPrice ? p.referenceMaxPrice : Math.round(p.sellingPrice * 1.25);
              const discountPercent = Math.round(((mrp - p.sellingPrice) / mrp) * 100);

              return (
                <div
                  key={p.id}
                  onClick={() => onNavigate('product-detail', { productId: p.id })}
                  className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-md hover:border-emerald-500/50 transition-all flex flex-col justify-between group cursor-pointer relative"
                >
                  <div className="p-3 sm:p-4">
                    {/* Photo Container with Amazon-style Badges */}
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-50 mb-3 border border-slate-100">
                      <img
                        src={imgUrl}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          // Fallback to organic greens placeholder if URL ever breaks
                          (e.currentTarget as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600';
                        }}
                      />

                      {/* Rating Pill (Amazon / Flipkart Star) */}
                      <span className="absolute top-2 left-2 bg-emerald-800 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                        <span>4.8</span>
                        <Star className="w-2.5 h-2.5 fill-white" />
                      </span>

                      {/* Discount Pill */}
                      {discountPercent > 5 && (
                        <span className="absolute top-2 right-2 bg-rose-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow-sm">
                          {discountPercent}% OFF
                        </span>
                      )}

                      {/* Hub Guarantee Tag */}
                      <span className="absolute bottom-2 left-2 bg-slate-900/85 backdrop-blur-sm text-slate-200 text-[9px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-1">
                        <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                        <span>Salem Hub Direct</span>
                      </span>
                    </div>

                    {/* Category & Title */}
                    <div className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider">
                      {p.category}
                    </div>

                    <h3 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1 mt-0.5 group-hover:text-emerald-700 transition">
                      {p.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium line-clamp-1">
                      {p.nameTamil || p.name}
                    </p>

                    {/* Stock Status Bar */}
                    <div className="mt-2 text-[10px] sm:text-[11px] flex items-center">
                      {inStock ? (
                        <span
                          className={`font-semibold ${
                            isLowStock ? 'text-amber-600 font-bold' : 'text-emerald-700'
                          }`}
                        >
                          ● {isLowStock ? `Only ${p.stockQuantity} ${p.unit} left!` : `In Stock (${p.stockQuantity} ${p.unit})`}
                        </span>
                      ) : (
                        <span className="text-rose-600 font-bold">● Out of stock</span>
                      )}
                    </div>
                  </div>

                  {/* Pricing and Action Buttons */}
                  <div className="p-3 sm:p-4 pt-0 border-t border-slate-100 mt-2 space-y-2">
                    <div className="flex items-baseline justify-between pt-2">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-extrabold text-base sm:text-lg text-slate-900">
                          ₹{p.sellingPrice}
                        </span>
                        <span className="text-[11px] text-slate-400">/{p.unit}</span>
                      </div>

                      {mrp > p.sellingPrice && (
                        <span className="text-[11px] text-slate-400 line-through">
                          ₹{mrp}
                        </span>
                      )}
                    </div>

                    {/* Flipkart / Amazon Style Quick Cart Stepper & Buy Now */}
                    <div className="grid grid-cols-2 gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {cartQty > 0 ? (
                        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-300 rounded-xl py-1 px-1.5 text-emerald-900">
                          <button
                            onClick={() => updateQuantity(p.id, cartQty - 1)}
                            className="p-1 hover:bg-emerald-200 rounded-lg transition"
                          >
                            <Minus className="w-3 h-3 text-emerald-800" />
                          </button>
                          <span className="text-xs font-bold">{cartQty}</span>
                          <button
                            onClick={() => updateQuantity(p.id, cartQty + 1)}
                            disabled={cartQty >= p.stockQuantity}
                            className="p-1 hover:bg-emerald-200 rounded-lg transition disabled:opacity-30"
                          >
                            <Plus className="w-3 h-3 text-emerald-800" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => handleAddToCart(p, e)}
                          disabled={!inStock}
                          className={`py-2 px-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shadow-sm ${
                            !inStock
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : isJustAdded
                              ? 'bg-emerald-700 text-white'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 active:scale-95'
                          }`}
                        >
                          {isJustAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Added</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Add</span>
                            </>
                          )}
                        </button>
                      )}

                      <button
                        onClick={(e) => handleBuyNow(p, e)}
                        disabled={!inStock}
                        className={`py-2 px-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shadow-sm ${
                          !inStock
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-emerald-700 hover:bg-emerald-800 text-white active:scale-95'
                        }`}
                      >
                        <span>Buy Now</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Global Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => {
          setIsCheckoutModalOpen(false);
          setDirectCheckoutItem(null);
        }}
        directItem={directCheckoutItem}
        onOrderSuccess={(orderId) => {
          showToast('Order confirmed successfully!');
          onNavigate('buyer-orders', { highlightOrderId: orderId });
        }}
      />
    </div>
  );
};

export default Marketplace;
