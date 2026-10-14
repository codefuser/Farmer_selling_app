import React, { useEffect, useState, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
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
} from 'lucide-react';

interface MarketplaceProps {
  onNavigate: (view: string, params?: any) => void;
}

export const Marketplace: React.FC<MarketplaceProps> = ({ onNavigate }) => {
  const { language, t } = useLanguage();
  const { cartItems, addStoreProduct, updateQuantity, openCart, cartCount } = useCart();

  const [products, setProducts] = useState<CentralInventoryProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [onlyInStock, setOnlyInStock] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<string>('RECOMMENDED');

  // Checkout modal
  const [directCheckoutItem, setDirectCheckoutItem] = useState<DirectCheckoutItem | null>(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
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
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadProducts();
  };

  const handleAddToCart = (product: CentralInventoryProduct) => {
    addStoreProduct(product, 1);
    setJustAddedId(product.id);
    showToast(
      language === 'ta'
        ? `${product.nameTamil || product.name} கூடையில் சேர்க்கப்பட்டது`
        : `Added 1 ${product.unit} of ${product.name} to cart`
    );
    setTimeout(() => setJustAddedId(null), 1500);
  };

  const handleBuyNow = (product: CentralInventoryProduct) => {
    setDirectCheckoutItem({
      productId: product.id,
      quantity: 1,
      title: language === 'ta' && product.nameTamil ? product.nameTamil : product.name,
      pricePerUnit: product.sellingPrice,
      unit: product.unit || 'kg',
      imageUrl: product.images?.[0] || '',
      farmerName: 'Ulavar2Ulagam Central Hub',
      village: product.originLocation || 'Salem Hub',
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
    { id: 'ALL', label: language === 'ta' ? 'அனைத்தும்' : 'All Produce' },
    { id: 'VEGETABLES', label: language === 'ta' ? 'காய்கறிகள்' : 'Vegetables' },
    { id: 'FRUITS', label: language === 'ta' ? 'பழங்கள்' : 'Fruits' },
    { id: 'GREENS', label: language === 'ta' ? 'கீரைகள்' : 'Greens' },
    { id: 'GRAINS', label: language === 'ta' ? 'தானியங்கள்' : 'Grains' },
    { id: 'PULSES', label: language === 'ta' ? 'பருப்பு' : 'Pulses' },
    { id: 'SEASONAL', label: language === 'ta' ? 'பருவகாலம்' : 'Seasonal' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl border border-emerald-500/40 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Storefront Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-medium text-emerald-200 mb-3 border border-white/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              {language === 'ta'
                ? 'உழவர் to உலகம் மத்திய சரக்கக அங்காடி'
                : 'Ulavar2Ulagam Central Hub Store'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            {language === 'ta'
              ? 'விவசாயிகளிடமிருந்து நேரடியாக. குடும்பத்திற்கு புதுமை.'
              : 'Direct from Local Farms. Carefully Inspected & Delivered.'}
          </h1>

          <p className="mt-2.5 text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            {language === 'ta'
              ? 'எங்கள் மத்திய சரக்ககத்தில் தரம் பரிசோதிக்கப்பட்டு, எடையிடப்பட்டு, வீடுகளுக்கு நேரடியாக அனுப்பப்படும் புதிய விளைபொருட்கள்.'
              : 'Procured at fair prices from verified producers. Inspected, cleaned, and dispatched from our central hub directly to your door.'}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-lg border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>Lab Inspected Quality</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-lg border border-white/10">
              <Clock className="w-3.5 h-3.5 text-emerald-300" />
              <span>Harvested within 24-48 hrs</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-lg border border-white/10">
              <Zap className="w-3.5 h-3.5 text-emerald-300" />
              <span>Doorstep Delivery with OTP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
        {/* Search Row */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
            <input
              type="text"
              placeholder={
                language === 'ta'
                  ? 'காய்கறி, பழங்கள் அல்லது தானியங்கள் தேடவும்...'
                  : 'Search fresh vegetables, fruits, rice, greens...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 text-xs sm:text-sm px-4 py-2.5 pl-10 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </form>

          <button
            onClick={loadProducts}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm transition shrink-0"
          >
            {language === 'ta' ? 'தேடு' : 'Search'}
          </button>

          {/* Quick Cart Shortcut */}
          <button
            onClick={openCart}
            className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 px-4 py-2.5 rounded-xl font-bold text-xs transition shrink-0"
          >
            <ShoppingCart className="w-4 h-4 text-emerald-700" />
            <span>{t('cart')}</span>
            <span className="bg-emerald-700 text-white px-2 py-0.5 rounded-full text-[10px]">
              {cartCount}
            </span>
          </button>
        </div>

        {/* Category Pills & Quick Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === c.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 shrink-0 text-xs">
            <label className="flex items-center gap-1.5 text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="font-medium">In Stock Only</span>
            </label>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-xl focus:outline-none"
            >
              <option value="RECOMMENDED">Featured / Recommended</option>
              <option value="PRICE_LOW">Price: Low to High</option>
              <option value="PRICE_HIGH">Price: High to Low</option>
              <option value="NEWEST">Newest Harvest</option>
            </select>
          </div>
        </div>
      </div>

      {/* Produce Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 animate-pulse">
              <div className="w-full aspect-square bg-slate-100 rounded-xl" />
              <div className="h-4 bg-slate-100 rounded w-3/4" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
              <div className="h-9 bg-slate-100 rounded-xl" />
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
          <Sprout className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-sm text-slate-800">No Produce Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search query, selecting another category, or unchecking "In Stock Only".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredProducts.map((p) => {
            const inStock = p.stockQuantity > 0;
            const isLowStock = p.stockQuantity > 0 && p.stockQuantity <= (p.lowStockThreshold || 10);
            const isJustAdded = justAddedId === p.id;
            const imgUrl = p.images?.[0] || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500';

            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between group"
              >
                <div className="p-3.5">
                  {/* Photo Container */}
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 mb-3">
                    <img
                      src={imgUrl}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      loading="lazy"
                    />

                    {/* Grade Badge */}
                    <span className="absolute top-2 left-2 bg-emerald-950/80 backdrop-blur-md text-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                      {p.qualityGrade || 'Grade A'}
                    </span>

                    {/* Origin Badge */}
                    {p.originLocation && (
                      <span className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-md text-slate-200 text-[10px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5 text-emerald-400" />
                        <span className="truncate max-w-[110px]">{p.originLocation}</span>
                      </span>
                    )}

                    {p.isOrganic && (
                      <span className="absolute top-2 right-2 bg-teal-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                        ORGANIC
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

                  {/* Stock Availability */}
                  <div className="mt-2 text-[11px] flex items-center justify-between">
                    {inStock ? (
                      <span
                        className={`font-semibold ${
                          isLowStock ? 'text-amber-600' : 'text-emerald-700'
                        }`}
                      >
                        ● {p.stockQuantity} {p.unit} in Central Hub
                      </span>
                    ) : (
                      <span className="text-rose-600 font-semibold">● Out of stock</span>
                    )}
                  </div>
                </div>

                {/* Footer: Price & Add / Buy buttons */}
                <div className="p-3.5 pt-0 border-t border-slate-100 mt-2 space-y-2">
                  <div className="flex items-baseline justify-between pt-2">
                    <div>
                      <span className="font-extrabold text-base text-slate-900">
                        ₹{p.sellingPrice}
                      </span>
                      <span className="text-[11px] text-slate-500"> / {p.unit}</span>
                    </div>

                    {p.avgProcurementCost > 0 && (
                      <span className="text-[10px] text-slate-400">
                        Procured @ ₹{p.avgProcurementCost}/{p.unit}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => handleAddToCart(p)}
                      disabled={!inStock}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shadow-sm ${
                        !inStock
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : isJustAdded
                          ? 'bg-emerald-700 text-white'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200'
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
                          <span>Add to Cart</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleBuyNow(p)}
                      disabled={!inStock}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shadow-sm ${
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
