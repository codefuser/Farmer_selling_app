import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import api from '../../services/api';
import FreshnessBadge from '../../components/common/FreshnessBadge';
import {
  X,
  Star,
  MapPin,
  ShieldCheck,
  Clock,
  ShoppingCart,
  Zap,
  Plus,
  Minus,
  CheckCircle2,
  Heart,
  TrendingDown,
  Truck,
  Award,
} from 'lucide-react';

interface ProductDetailPageProps {
  batch?: any;
  productId?: string;
  onNavigate?: (view: string, params?: any) => void;
  onClose?: () => void;
  onBuyNow?: (batch: any, quantity: number) => void;
  onOpenChatWithUser?: (targetUserId: string) => void;
  onOpenChat?: (targetUser?: any) => void;
  onViewFarmerProfile?: (farmerId: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  batch: initialBatch,
  productId,
  onNavigate,
  onClose = () => onNavigate && onNavigate('buyer-marketplace'),
  onBuyNow = (b, q) => onNavigate && onNavigate('buyer-marketplace'),
  onOpenChatWithUser,
  onOpenChat,
  onViewFarmerProfile = (fId) => onNavigate && onNavigate('farmer-public-profile', { farmerId: fId }),
}) => {
  const { language, t } = useLanguage();
  const { addToCart } = useCart();

  const [batch, setBatch] = useState<any>(initialBatch || null);
  const [loadingBatch, setLoadingBatch] = useState(!initialBatch && !!productId);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    if (!initialBatch && productId) {
      setLoadingBatch(true);
      api
        .getMarketplaceProduce({})
        .then((res: any[]) => {
          const found = (res || []).find((b: any) => b.id === productId || b.productId === productId);
          if (found) setBatch(found);
          setLoadingBatch(false);
        })
        .catch(() => setLoadingBatch(false));
    }
  }, [initialBatch, productId]);

  const [quantity, setQuantity] = useState(
    batch ? Math.min(10, Math.max(1, Math.round((batch?.quantity || 10) * 0.1) || 5)) : 5
  );
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToast, setAddedToast] = useState(false);

  const toggleWishlist = async () => {
    if (!batch) return;
    setWishlistLoading(true);
    try {
      if (isWishlisted) {
        setIsWishlisted(false);
      } else {
        await api.addToWishlist({ batchId: batch.id, productId: batch.productId });
        setIsWishlisted(true);
      }
    } catch (e) {
      console.warn('Wishlist toggle error:', e);
    } finally {
      setWishlistLoading(false);
    }
  };

  if (loadingBatch) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-3xl text-center shadow-xl">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-600">Loading harvest details...</p>
        </div>
      </div>
    );
  }

  if (!batch) {
    return null;
  }

  const maxQty = batch.quantity;
  const pricePerKg = batch.pricePerKg;
  const subtotal = quantity * pricePerKg;

  // Comparison with reference market price (Mandi modal rate)
  const mandiModalPrice =
    batch.product?.marketPrices?.[0]?.modalPrice ||
    Math.round(((batch.product?.referenceMinPrice || 24) + (batch.product?.referenceMaxPrice || 35)) / 2);
  const isCheaperThanMandi = pricePerKg < mandiModalPrice;
  const savingsPercent = isCheaperThanMandi
    ? Math.round(((mandiModalPrice - pricePerKg) / mandiModalPrice) * 100)
    : 0;

  const handleIncrement = () => {
    if (quantity < maxQty) {
      setQuantity((prev) => Math.min(maxQty, prev + (maxQty > 20 ? 5 : 1)));
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => Math.max(1, prev - (maxQty > 20 ? 5 : 1)));
    }
  };

  const handleAddToCart = async () => {
    setAddingToCart(true);
    const ok = await addToCart(batch.id, quantity);
    setAddingToCart(false);
    if (ok) {
      setAddedToast(true);
      setTimeout(() => setAddedToast(false), 2500);
    }
  };

  const productName = language === 'ta' ? batch.product?.nameTamil : batch.product?.name;
  const farmerName = batch.farmer?.user?.name || (language === 'ta' ? 'விவசாயி' : 'Farmer');
  const village = batch.village || batch.farmer?.village || 'Salem';
  const rating = batch.farmer?.rating || 4.8;
  const distance = batch.distanceKm ? `${batch.distanceKm} km` : '5.2 km';
  const farmerUserId = batch.farmer?.user?.id || batch.farmer?.userId;
  const farmerProfileId = batch.farmer?.id;
  const completedOrders = batch.farmer?.completedOrders || 12;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 animate-in slide-in-from-bottom-6 duration-200">
        {/* Modal Header Bar */}
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            {language === 'ta' ? 'நேரடி அறுவடை விவரம்' : 'Direct Harvest Details'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleWishlist}
              disabled={wishlistLoading}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                isWishlisted ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 hover:bg-slate-200 text-slate-500'
              }`}
              title="Save to Wishlist"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-4 flex-1">
          {/* Large Hero Image */}
          <div className="w-full h-56 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative">
            <img
              src={batch.imageUrl || batch.product?.imageUrl}
              alt={productName}
              className="w-full h-full object-cover"
              onError={(e: any) => {
                e.target.src = 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=500&q=80';
              }}
            />
            <div className="absolute top-3 left-3">
              <FreshnessBadge
                status={batch.freshnessStatus}
                hoursRemaining={batch.freshness?.hoursRemaining}
                minutesRemaining={batch.freshness?.minutesRemaining}
              />
            </div>
            <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-xs font-bold">
              {language === 'ta' ? `கையிருப்பு: ${batch.quantity} kg` : `${batch.quantity} kg in stock`}
            </div>
          </div>

          {/* Title & Pricing */}
          <div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h1 className="text-xl font-black text-slate-900">
                  {productName}
                </h1>
                <span className="text-xs text-slate-500 mt-0.5 block">
                  {batch.product?.category} · {language === 'ta' ? `தரம் ${batch.qualityGrade}` : `Grade ${batch.qualityGrade}`}
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-emerald-700 block leading-tight">
                  ₹{pricePerKg}
                  <span className="text-xs font-normal text-slate-500"> / kg</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {t('fairPriceZone')}
                </span>
              </div>
            </div>
          </div>

          {/* Mandi Price Comparison Card (Phase 2) */}
          <div className="p-3 bg-gradient-to-r from-amber-50 to-emerald-50 rounded-2xl border border-amber-200/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
                <TrendingDown className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-800 block text-xs">
                  {language === 'ta' ? 'அரசு மண்டி சந்தை விலை' : 'Mandi Benchmark Rate'}
                </span>
                <span className="text-[11px] text-slate-500">
                  Salem APMC: ₹{mandiModalPrice}/kg
                </span>
              </div>
            </div>

            {isCheaperThanMandi ? (
              <div className="text-right">
                <span className="bg-emerald-600 text-white font-extrabold text-[11px] px-2 py-0.5 rounded-md">
                  {savingsPercent}% {language === 'ta' ? 'குறைவு' : 'Cheaper'}
                </span>
                <span className="text-[10px] text-emerald-800 font-semibold block mt-0.5">
                  Direct Farmer Deal
                </span>
              </div>
            ) : (
              <span className="text-[11px] font-bold text-slate-600">Fair Rate</span>
            )}
          </div>

          {/* Farmer & Location Trust Card (Phase 2 Verification Badge) */}
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 flex items-center justify-between text-xs">
            <button
              onClick={() => {
                if (onViewFarmerProfile && farmerProfileId) {
                  onClose();
                  onViewFarmerProfile(farmerProfileId);
                }
              }}
              className="flex items-center gap-2.5 text-left hover:opacity-80 transition"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                {farmerName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-1 font-bold text-slate-900">
                  <span>{farmerName}</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>{village} ({distance})</span>
                </div>
              </div>
            </button>

            <div className="flex items-center gap-2">
              {farmerUserId && onOpenChatWithUser && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenChatWithUser(farmerUserId);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-50 font-bold text-[11px] transition shadow-xs"
                >
                  {language === 'ta' ? 'நேரடி அரட்டை' : 'Chat'}
                </button>
              )}

              <div className="text-right">
                <div className="flex items-center gap-0.5 text-amber-600 font-bold justify-end">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{rating}</span>
                </div>
                <span className="text-[10px] text-emerald-700 font-semibold block">
                  {completedOrders} {language === 'ta' ? 'ஆர்டர்கள்' : 'orders'}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery Channels Preview (Phase 2) */}
          <div className="bg-slate-50/70 rounded-2xl p-3 border border-slate-200/70">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2">
              <Truck className="w-3.5 h-3.5 text-emerald-600" />
              {language === 'ta' ? 'கிடைக்கும் டெலிவரி முறைகள்' : 'Available Delivery Options'}
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-white p-2 rounded-xl border border-slate-200/80">
                <div className="font-bold text-slate-800 flex items-center justify-between">
                  <span>Standard</span>
                  <span className="text-emerald-700 font-black">₹30-40</span>
                </div>
                <span className="text-slate-500 text-[10px]">1-2 days dispatched</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-200/80">
                <div className="font-bold text-slate-800 flex items-center justify-between">
                  <span>Self Pickup</span>
                  <span className="text-emerald-600 font-black">FREE</span>
                </div>
                <span className="text-slate-500 text-[10px]">Direct from farm</span>
              </div>
            </div>
          </div>

          {/* Quantity Stepper & Subtotal Calculator */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-700">
                {t('quantity')}
              </span>
              <div className="flex items-center gap-3 bg-white rounded-xl border border-emerald-300 px-2 py-1 shadow-xs">
                <button
                  onClick={handleDecrement}
                  disabled={quantity <= 1}
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 flex items-center justify-center text-slate-700 transition"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-black text-sm text-slate-900 min-w-[40px] text-center">
                  {quantity} kg
                </span>
                <button
                  onClick={handleIncrement}
                  disabled={quantity >= maxQty}
                  className="w-8 h-8 rounded-lg bg-emerald-700 hover:bg-emerald-800 disabled:opacity-30 flex items-center justify-center text-white transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex gap-1.5 mb-3">
              {[5, 10, 25, 50].filter(q => q <= maxQty).map((preset) => (
                <button
                  key={preset}
                  onClick={() => setQuantity(preset)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                    quantity === preset
                      ? 'bg-emerald-700 border-emerald-700 text-white'
                      : 'bg-white border-emerald-200 text-slate-700'
                  }`}
                >
                  {preset} kg
                </button>
              ))}
            </div>

            {/* Subtotal Calculation Line */}
            <div className="pt-2 border-t border-emerald-200/80 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">
                {quantity} kg × ₹{pricePerKg} =
              </span>
              <span className="text-base font-black text-emerald-800">
                ₹{subtotal.toLocaleString()}
              </span>
            </div>
          </div>

          {addedToast && (
            <div className="p-3 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>{language === 'ta' ? 'கூடையில் வெற்றிகரமாக சேர்க்கப்பட்டது!' : 'Added to cart successfully!'}</span>
            </div>
          )}
        </div>

        {/* Sticky Bottom Actions */}
        <div className="p-4 border-t border-slate-100 bg-white flex gap-2.5">
          <button
            onClick={handleAddToCart}
            disabled={addingToCart}
            className="flex-1 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition active:scale-98"
          >
            <ShoppingCart className="w-4 h-4 text-slate-600" />
            <span>{t('addToCart')}</span>
          </button>

          <button
            onClick={() => onBuyNow(batch, quantity)}
            className="flex-1 h-12 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition active:scale-98"
          >
            <Zap className="w-4 h-4" />
            <span>{t('buyNow')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
