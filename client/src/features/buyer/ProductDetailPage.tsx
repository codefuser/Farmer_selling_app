import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
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
} from 'lucide-react';

interface ProductDetailPageProps {
  batch: any;
  onClose: () => void;
  onBuyNow: (batch: any, quantity: number) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  batch,
  onClose,
  onBuyNow,
}) => {
  const { language, t } = useLanguage();
  const { addToCart } = useCart();

  const [quantity, setQuantity] = useState(Math.min(10, Math.max(1, Math.round(batch.quantity * 0.1) || 5)));
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToast, setAddedToast] = useState(false);

  const maxQty = batch.quantity;
  const pricePerKg = batch.pricePerKg;
  const subtotal = quantity * pricePerKg;

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

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 animate-in slide-in-from-bottom-6 duration-200">
        {/* Modal Header Bar */}
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {language === 'ta' ? 'விளைபொருள் விவரம்' : 'Produce Details'}
          </span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
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

          {/* Farmer & Location Trust Card */}
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                {farmerName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-1 font-bold text-slate-900">
                  <span>{farmerName}</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>{village} ({distance})</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-0.5 text-amber-600 font-bold justify-end">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{rating}</span>
              </div>
              <span className="text-[10px] text-slate-400">
                {language === 'ta' ? 'சரிபார்க்கப்பட்டது' : 'Verified Farmer'}
              </span>
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
