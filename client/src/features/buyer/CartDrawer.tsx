import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
  onExplore: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  onProceedToCheckout,
  onExplore,
}) => {
  const { language, t } = useLanguage();
  const {
    cartItems,
    cartCount,
    subtotal,
    deliveryFee,
    total,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl border-l border-slate-200 animate-in slide-in-from-right-10 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-900">
                {t('cart')} ({cartCount})
              </h2>
              <span className="text-[10px] text-slate-500">
                {language === 'ta' ? 'விவசாயிகளிடமிருந்து நேரடி தேர்வு' : 'Direct from local farmers'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {cartCount > 0 && (
              <button
                onClick={clearCart}
                className="text-[11px] text-rose-600 hover:underline font-semibold px-2 py-1"
              >
                {language === 'ta' ? 'அழி' : 'Clear'}
              </button>
            )}
            <button
              onClick={closeCart}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {cartCount === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-500">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mb-3 text-slate-300">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-sm text-slate-800 mb-1">
              {t('emptyCartTitle')}
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mb-5">
              {t('emptyCartDesc')}
            </p>
            <button
              onClick={() => {
                closeCart();
                onExplore();
              }}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm transition"
            >
              {t('exploreMarketplace')}
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cartItems.map((item) => {
              const productName = language === 'ta' ? item.batch?.product?.nameTamil : item.batch?.product?.name;
              const farmerName = item.batch?.farmer?.user?.name || (language === 'ta' ? 'விவசாயி' : 'Farmer');

              return (
                <div
                  key={item.id}
                  className="bg-slate-50 rounded-2xl p-3 border border-slate-200/90 flex gap-3 items-center"
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-white shrink-0 border border-slate-200">
                    <img
                      src={item.batch?.imageUrl || item.batch?.product?.imageUrl}
                      alt={productName}
                      className="w-full h-full object-cover"
                      onError={(e: any) => {
                        e.target.src = 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=200&q=80';
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-xs text-slate-900 truncate">
                      {productName}
                    </h4>
                    <div className="text-[11px] text-slate-500 truncate">
                      {farmerName} · {item.batch?.village || 'Salem'}
                    </div>
                    <div className="text-xs font-bold text-emerald-800 mt-1">
                      ₹{item.batch?.pricePerKg} / kg
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <div className="flex items-center gap-1.5 bg-white rounded-lg border border-slate-200 p-0.5">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - (item.quantity > 20 ? 5 : 1))}
                        className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 text-xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-slate-900 min-w-[28px] text-center">
                        {item.quantity} kg
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + (item.quantity >= 20 ? 5 : 1))}
                        className="w-6 h-6 rounded bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center text-xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Price Summary & Checkout Action */}
        {cartCount > 0 && (
          <div className="p-4 border-t border-slate-100 bg-white space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>{t('subtotal')}</span>
                <span className="font-bold text-slate-900">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>{t('deliveryFee')}</span>
                <span className="font-bold text-slate-900">₹{deliveryFee}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-900 pt-1.5 border-t border-slate-100">
                <span>{t('total')}</span>
                <span className="text-emerald-700">₹{total.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => {
                closeCart();
                onProceedToCheckout();
              }}
              className="w-full h-12 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 active:scale-98"
            >
              <span>{t('proceedToCheckout')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
