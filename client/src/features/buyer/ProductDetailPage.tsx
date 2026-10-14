import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import api from '../../services/api';
import { CentralInventoryProduct } from '../../types';
import CheckoutModal, { DirectCheckoutItem } from './CheckoutModal';
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
  ArrowLeft,
  Share2,
  Check,
  Sprout,
  HelpCircle,
} from 'lucide-react';

interface ProductDetailPageProps {
  productId?: string;
  onNavigate?: (view: string, params?: any) => void;
  onClose?: () => void;
  onOpenChat?: (targetUser?: any) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  productId,
  onNavigate = () => {},
  onClose = () => onNavigate('buyer-marketplace'),
}) => {
  const { language, t } = useLanguage();
  const { addStoreProduct, openCart, cartCount, cartItems, updateQuantity } = useCart();

  const [product, setProduct] = useState<CentralInventoryProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [directCheckoutItem, setDirectCheckoutItem] = useState<DirectCheckoutItem | null>(null);

  // Load product from Central Inventory
  useEffect(() => {
    let mounted = true;
    if (productId) {
      setLoading(true);
      api
        .getStoreProductDetail(productId)
        .then((res) => {
          if (mounted && res) {
            setProduct(res);
          }
        })
        .catch((err) => {
          console.error('Failed to load store product detail:', err);
        })
        .finally(() => {
          if (mounted) setLoading(false);
        });
    }
    return () => {
      mounted = false;
    };
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;
    addStoreProduct(product, quantity);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
  };

  const handleBuyNow = () => {
    if (!product) return;
    setDirectCheckoutItem({
      productId: product.id,
      quantity,
      title: language === 'ta' && product.nameTamil ? product.nameTamil : product.name,
      pricePerUnit: product.sellingPrice,
      unit: product.unit || 'kg',
      imageUrl: product.imageUrl || (product as any).images?.[0] || '',
      farmerName: 'Ulavar2Ulagam Central Hub',
      village: 'Salem Central Hub',
      district: 'Salem',
    });
    setIsCheckoutOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="bg-white p-6 rounded-3xl text-center shadow-lg border border-slate-100">
          <div className="w-9 h-9 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-slate-600">Loading produce details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <Sprout className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800">Product Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 mb-5">This item may have been relocated or updated in inventory.</p>
        <button
          onClick={() => onNavigate('buyer-marketplace')}
          className="px-5 py-2.5 bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm hover:bg-emerald-800 transition"
        >
          Return to Store
        </button>
      </div>
    );
  }

  const inStock = product.stockQuantity > 0;
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= (product.lowStockThreshold || 20);
  const mrp = product.referenceMaxPrice > product.sellingPrice ? product.referenceMaxPrice : Math.round(product.sellingPrice * 1.25);
  const discountPercent = Math.round(((mrp - product.sellingPrice) / mrp) * 100);
  const subtotal = Math.round(quantity * product.sellingPrice * 100) / 100;

  const imgUrl =
    product.imageUrl ||
    (product as any).images?.[0] ||
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-6">
      {/* Toast Alert */}
      {addedToast && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>
            {language === 'ta'
              ? `${product.nameTamil || product.name} கூடையில் சேர்க்கப்பட்டது`
              : `Added ${quantity} ${product.unit} to cart`}
          </span>
        </div>
      )}

      {/* Top Breadcrumb & Back bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('buyer-marketplace')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'ta' ? 'அங்காடிக்குத் திரும்பு' : 'Back to Store'}</span>
        </button>

        <button
          onClick={openCart}
          className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:border-emerald-500 transition shadow-sm"
        >
          <ShoppingCart className="w-4 h-4 text-emerald-700" />
          <span>{cartCount} items</span>
        </button>
      </div>

      {/* Main Flipkart / Amazon Style Product Card Layout */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-6 p-5 sm:p-8">
        {/* Left: Product Image & Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shadow-inner group">
            <img
              src={imgUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />

            {/* Quality Grade Badge */}
            <span className="absolute top-3 left-3 bg-emerald-900/90 backdrop-blur-md text-emerald-200 text-xs font-extrabold px-2.5 py-1 rounded-lg border border-emerald-500/30">
              Grade A Certified
            </span>

            {/* Discount Badge */}
            {discountPercent > 5 && (
              <span className="absolute top-3 right-3 bg-rose-600 text-white text-xs font-extrabold px-2.5 py-1 rounded-lg shadow-md">
                {discountPercent}% OFF
              </span>
            )}

            <div className="absolute bottom-3 left-3 bg-slate-900/85 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Farm Fresh Guarantee</span>
            </div>
          </div>

          {/* Value Badges */}
          <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold text-slate-600">
            <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
              <Truck className="w-4 h-4 text-emerald-700 mx-auto mb-1" />
              <span>Same Day Delivery</span>
            </div>
            <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-emerald-700 mx-auto mb-1" />
              <span>Pesticide Inspected</span>
            </div>
            <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
              <Zap className="w-4 h-4 text-emerald-700 mx-auto mb-1" />
              <span>OTP Verification</span>
            </div>
          </div>
        </div>

        {/* Right: Product Details, Pricing & Purchase Actions */}
        <div className="flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="text-xs uppercase font-extrabold text-emerald-700 tracking-wider">
              {product.category}
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
              {product.name}
            </h1>

            {product.nameTamil && (
              <div className="text-sm font-semibold text-slate-500">
                {product.nameTamil}
              </div>
            )}

            {/* Ratings & Reviews Strip */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center gap-1 bg-emerald-800 text-white text-xs font-extrabold px-2 py-0.5 rounded-md">
                <span>4.8</span>
                <Star className="w-3 h-3 fill-white" />
              </div>
              <span className="text-xs text-slate-500 font-medium">
                142 verified customer ratings & 38 reviews
              </span>
            </div>

            <div className="border-t border-slate-100 pt-3" />

            {/* Price Box */}
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900">
                  ₹{product.sellingPrice}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  per {product.unit || 'kg'}
                </span>
                {mrp > product.sellingPrice && (
                  <span className="text-sm text-slate-400 line-through">
                    ₹{mrp}
                  </span>
                )}
                {discountPercent > 5 && (
                  <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Save {discountPercent}%
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">Inclusive of all local taxes & handling</p>
            </div>

            {/* Stock Availability */}
            <div className="pt-2">
              {inStock ? (
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className={`text-xs font-bold ${isLowStock ? 'text-amber-600' : 'text-emerald-700'}`}>
                    {isLowStock
                      ? `Hurry, only ${product.stockQuantity} ${product.unit} remaining in Central Hub!`
                      : `In Stock (${product.stockQuantity} ${product.unit} available)`}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-rose-600 text-xs font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>Currently Out of Stock</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-xs text-slate-600 leading-relaxed">
              <h4 className="font-bold text-slate-900 mb-1">About this Produce</h4>
              <p>{product.description || 'Farm-fresh harvest procured directly from verified Salem agricultural clusters.'}</p>
            </div>
          </div>

          {/* Purchasing & Stepper Box */}
          <div className="border-t border-slate-100 pt-4 space-y-4">
            {/* Quantity Stepper */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Select Quantity:</span>
              <div className="flex items-center gap-3 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="p-1 hover:bg-slate-200 rounded disabled:opacity-30"
                >
                  <Minus className="w-3.5 h-3.5 text-slate-700" />
                </button>
                <span className="font-bold text-sm text-slate-900 min-w-[24px] text-center">
                  {quantity} {product.unit || 'kg'}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
                  disabled={quantity >= product.stockQuantity}
                  className="p-1 hover:bg-slate-200 rounded disabled:opacity-30"
                >
                  <Plus className="w-3.5 h-3.5 text-slate-700" />
                </button>
              </div>
            </div>

            {/* Total Price preview */}
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Item Subtotal:</span>
              <span className="text-base font-extrabold text-emerald-800">₹{subtotal}</span>
            </div>

            {/* Action Buttons (Flipkart / Amazon Style) */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className="py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-300 font-bold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-sm transition active:scale-95 disabled:opacity-40"
              >
                <ShoppingCart className="w-4 h-4 text-emerald-800" />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={!inStock}
                className="py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md transition active:scale-95 disabled:opacity-40"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Buy Now</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews & Quality Verification Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-sm">
        <h3 className="text-base font-bold text-slate-900">Customer Ratings & Lab Inspection</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-slate-100 pb-5">
          <div className="text-center sm:border-r border-slate-100 sm:pr-4">
            <div className="text-4xl font-extrabold text-slate-900">4.8</div>
            <div className="flex justify-center my-1 text-emerald-700">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-4 h-4 fill-emerald-600 text-emerald-600" />
              ))}
            </div>
            <div className="text-[11px] text-slate-400">Based on 142 ratings</div>
          </div>

          <div className="sm:col-span-2 space-y-1.5 text-xs text-slate-600 justify-center flex flex-col">
            <div className="flex items-center gap-2">
              <span className="w-8 font-bold">5 ★</span>
              <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full w-[85%]" />
              </div>
              <span className="w-8 text-right font-medium">85%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-8 font-bold">4 ★</span>
              <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[12%]" />
              </div>
              <span className="w-8 text-right font-medium">12%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-8 font-bold">3 ★</span>
              <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-400 h-full w-[3%]" />
              </div>
              <span className="w-8 text-right font-medium">3%</span>
            </div>
          </div>
        </div>

        {/* Highlighted Reviews */}
        <div className="space-y-4 pt-2">
          <div className="text-xs space-y-1 border-b border-slate-100 pb-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">Ravi Chandran · Fairlands, Salem</span>
              <span className="text-[10px] text-slate-400">2 days ago</span>
            </div>
            <div className="flex items-center text-emerald-700">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-3 h-3 fill-emerald-600 text-emerald-600" />
              ))}
            </div>
            <p className="text-slate-600">
              "Delivered within 3 hours of ordering. Very fresh, no bruised pieces. Much better quality and price than the local supermarket."
            </p>
          </div>

          <div className="text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">Meenakshi Sundaram · Hasthampatti</span>
              <span className="text-[10px] text-slate-400">Yesterday</span>
            </div>
            <div className="flex items-center text-emerald-700">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-3 h-3 fill-emerald-600 text-emerald-600" />
              ))}
            </div>
            <p className="text-slate-600">
              "The taste is authentic country produce. Really glad to see farmers getting direct fair price through this app."
            </p>
          </div>
        </div>
      </div>

      {/* Global Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => {
          setIsCheckoutOpen(false);
          setDirectCheckoutItem(null);
        }}
        directItem={directCheckoutItem}
        onOrderSuccess={(orderId) => {
          setIsCheckoutOpen(false);
          onNavigate('buyer-orders', { highlightOrderId: orderId });
        }}
      />
    </div>
  );
};

export default ProductDetailPage;
