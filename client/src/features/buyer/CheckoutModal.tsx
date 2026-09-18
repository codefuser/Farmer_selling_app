import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  X,
  ShieldCheck,
  MapPin,
  Phone,
  CreditCard,
  Truck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShoppingBag,
  Clock,
  Zap,
  UserCheck,
} from 'lucide-react';

export interface DirectCheckoutItem {
  batchId: string;
  quantity: number;
  title: string;
  pricePerUnit: number;
  unit: string;
  imageUrl?: string;
  farmerName?: string;
  village?: string;
  district?: string;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  directItem?: DirectCheckoutItem | null;
  onOrderSuccess: (orderId: string) => void;
}

type DeliveryMethodType = 'STANDARD' | 'EXPRESS' | 'FARMER_DIRECT' | 'SELF_PICKUP';

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  directItem,
  onOrderSuccess,
}) => {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const { cartItems, subtotal: cartSubtotal, clearCart } = useCart();

  const initialAddress =
    user?.buyerProfile?.address ||
    [user?.farmerProfile?.village, user?.farmerProfile?.district, user?.farmerProfile?.state]
      .filter(Boolean)
      .join(', ') ||
    'Salem Central Market, Tamil Nadu';
  const initialPhone = user?.mobile || '+91 98765 43210';

  const [address, setAddress] = useState(initialAddress);
  const [phone, setPhone] = useState(initialPhone);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethodType>('STANDARD');
  const [deliveryQuotes, setDeliveryQuotes] = useState<Record<DeliveryMethodType, any> | null>(null);
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'NET_BANKING' | 'ESCROW' | 'COD'>('ESCROW');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Determine items
  const isDirectBuy = !!directItem;
  const items = isDirectBuy
    ? [
        {
          batchId: directItem.batchId,
          quantity: directItem.quantity,
          title: directItem.title,
          pricePerUnit: directItem.pricePerUnit,
          unit: directItem.unit,
          imageUrl: directItem.imageUrl,
          farmerName: directItem.farmerName,
          village: directItem.village,
          district: directItem.district,
          itemTotal: directItem.quantity * directItem.pricePerUnit,
        },
      ]
    : cartItems.map((ci) => ({
        batchId: ci.batchId,
        quantity: ci.quantity,
        title: ci.batch?.product?.nameTamil || ci.batch?.cropName || 'விளைபொருள்',
        pricePerUnit: ci.batch?.pricePerKg || ci.batch?.pricePerUnit || 0,
        unit: ci.batch?.product?.unit || ci.batch?.unit || 'kg',
        imageUrl: ci.batch?.imageUrl || ci.batch?.images?.[0]?.imageUrl,
        farmerName: ci.batch?.farmer?.user?.name || ci.batch?.farmer?.businessName,
        village: ci.batch?.village,
        district: ci.batch?.district,
        itemTotal: ci.quantity * (ci.batch?.pricePerKg || ci.batch?.pricePerUnit || 0),
      }));

  const subtotal = isDirectBuy ? directItem.quantity * directItem.pricePerUnit : cartSubtotal;
  const totalWeight = items.reduce((sum, i) => sum + i.quantity, 0);

  // Fetch live delivery estimation options
  useEffect(() => {
    if (!isOpen || items.length === 0) return;

    let isMounted = true;
    const fetchEstimates = async () => {
      setLoadingQuotes(true);
      try {
        const firstItem = items[0];
        const res = await api.getDeliveryEstimate({
          totalWeightKg: totalWeight,
          originDistrict: firstItem?.district,
          originVillage: firstItem?.village,
          batchId: firstItem?.batchId,
        });

        if (isMounted && res.options) {
          setDeliveryQuotes(res.options as Record<DeliveryMethodType, any>);
        }
      } catch (err) {
        console.warn('Failed to load delivery estimates, using fallback:', err);
      } finally {
        if (isMounted) setLoadingQuotes(false);
      }
    };

    fetchEstimates();
    return () => {
      isMounted = false;
    };
  }, [isOpen, totalWeight, items]);

  if (!isOpen) return null;

  // Active delivery fee based on selected method
  const activeDeliveryFee = deliveryQuotes
    ? deliveryQuotes[deliveryMethod]?.totalDeliveryFee || 0
    : deliveryMethod === 'SELF_PICKUP'
    ? 0
    : deliveryMethod === 'FARMER_DIRECT'
    ? 25
    : deliveryMethod === 'EXPRESS'
    ? 80
    : 40;

  const grandTotal = Math.round((subtotal + activeDeliveryFee) * 100) / 100;
  const platformFee = Math.round(subtotal * 0.02 * 100) / 100;
  const farmerEarnings = Math.round((subtotal - platformFee) * 100) / 100;
  const estimatedSavings = Math.round(subtotal * 0.18); // ~18% saved vs intermediary prices

  const handleConfirmOrder = async () => {
    if (!address.trim()) {
      setErrorMessage(
        language === 'ta' ? 'தயவுசெய்து டெலிவரி முகவரியை உள்ளிடவும்' : 'Please provide a delivery address'
      );
      return;
    }

    if (items.length === 0) {
      setErrorMessage(
        language === 'ta' ? 'ஆர்டர் செய்ய பொருட்கள் எதுவும் இல்லை' : 'No items found to checkout'
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        items: items.map((it) => ({
          batchId: it.batchId,
          quantity: it.quantity,
        })),
        deliveryAddress: `${address} (Phone: ${phone})`,
        deliveryMethod,
        paymentMethod: paymentMethod === 'ESCROW' ? 'MOCK_UPI' : paymentMethod,
        notes: notes.trim() || undefined,
      };

      const res = await api.checkout(payload);

      if (!isDirectBuy) {
        await clearCart();
      }

      onClose();
      onOrderSuccess(res.order?.id || 'new-order');
    } catch (err: any) {
      console.error('Checkout failed:', err);
      setErrorMessage(
        err.message ||
          (language === 'ta'
            ? 'ஆர்டர் செய்வதில் சிக்கல் ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.'
            : 'Checkout failed. Please try again.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100 animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-black text-sm text-slate-900 tracking-tight">
                {language === 'ta' ? 'ஆர்டர் உறுதி செய்தல்' : 'Complete Order'}
              </h2>
              <span className="text-[10px] text-emerald-800 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                {language === 'ta' ? 'பாதுகாப்பான எஸ்க்ரோ கட்டணம்' : 'Secure Escrow Checkout'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/60 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Items Summary Card */}
          <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-200/70 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 pb-1.5 border-b border-slate-200/50">
              <span>{language === 'ta' ? 'தேர்ந்தெடுக்கப்பட்ட பொருட்கள்' : 'Selected Produce'} ({items.length})</span>
              <span className="text-[11px] text-emerald-700 font-semibold">
                {totalWeight} kg Total
              </span>
            </div>

            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1">
                  <div className="flex items-center gap-2">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                        {item.title.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-slate-800 line-clamp-1">{item.title}</h4>
                      <p className="text-[10px] text-slate-500">
                        {item.quantity} {item.unit} × ₹{item.pricePerUnit}
                        {item.farmerName ? ` • ${item.farmerName}` : ''}
                      </p>
                    </div>
                  </div>
                  <span className="font-extrabold text-slate-900">
                    ₹{item.itemTotal.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Method Selector (Phase 2) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-emerald-600" />
                {t('deliveryMethod')}
              </span>
              {loadingQuotes && (
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Calculating fee...
                </span>
              )}
            </label>

            <div className="grid grid-cols-2 gap-2">
              {/* Standard */}
              <button
                type="button"
                onClick={() => setDeliveryMethod('STANDARD')}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                  deliveryMethod === 'STANDARD'
                    ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-500'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-slate-900 flex items-center gap-1">
                    <Truck className="w-3 h-3 text-emerald-600" />
                    {t('standardDelivery')}
                  </span>
                  <span className="text-xs font-black text-emerald-700">
                    ₹{deliveryQuotes?.STANDARD?.totalDeliveryFee ?? 40}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 leading-tight flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" /> 1-2 Days • Coordinated logistics
                </span>
              </button>

              {/* Express */}
              <button
                type="button"
                onClick={() => setDeliveryMethod('EXPRESS')}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                  deliveryMethod === 'EXPRESS'
                    ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-500'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-slate-900 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-500" />
                    {t('expressDelivery')}
                  </span>
                  <span className="text-xs font-black text-emerald-700">
                    ₹{deliveryQuotes?.EXPRESS?.totalDeliveryFee ?? 80}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 leading-tight flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" /> Same Day • Priority vehicle
                </span>
              </button>

              {/* Farmer Direct */}
              <button
                type="button"
                onClick={() => setDeliveryMethod('FARMER_DIRECT')}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                  deliveryMethod === 'FARMER_DIRECT'
                    ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-500'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-slate-900 flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-blue-600" />
                    {t('farmerDirectDelivery')}
                  </span>
                  <span className="text-xs font-black text-emerald-700">
                    ₹{deliveryQuotes?.FARMER_DIRECT?.totalDeliveryFee ?? 25}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 leading-tight">
                  Local farm drop directly by seller
                </span>
              </button>

              {/* Self Pickup */}
              <button
                type="button"
                onClick={() => setDeliveryMethod('SELF_PICKUP')}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                  deliveryMethod === 'SELF_PICKUP'
                    ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-500'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-slate-900 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-purple-600" />
                    {t('selfPickup')}
                  </span>
                  <span className="text-xs font-black text-emerald-600 uppercase">
                    FREE
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 leading-tight">
                  Collect directly at farmer collection point
                </span>
              </button>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              {t('deliveryAddress')}
            </label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={
                language === 'ta'
                  ? 'கதவு எண், தெரு, ஊர், மாவட்டம், பின்கோடு'
                  : 'Door No, Street, Town/Mandi, District, PIN'
              }
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition resize-none"
            />
          </div>

          {/* Contact Phone */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              {language === 'ta' ? 'தொடர்பு கைபேசி எண்' : 'Contact Phone for Delivery'}
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
              {t('paymentMethod')}
            </label>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('ESCROW')}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                  paymentMethod === 'ESCROW'
                    ? 'border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-500'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-slate-900">
                    {language === 'ta' ? 'கிசான் எஸ்க்ரோ' : 'Kisan Escrow'}
                  </span>
                  {paymentMethod === 'ESCROW' && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                </div>
                <span className="text-[10px] text-slate-500 leading-tight">
                  {language === 'ta' ? 'UPI / கார்டு / நெட்பேங்கிங் (பாதுகாப்பானது)' : 'UPI / Card / NetBanking (Guaranteed)'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('COD')}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                  paymentMethod === 'COD'
                    ? 'border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-500'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-slate-900">
                    {language === 'ta' ? 'நேரடி ரொக்கம்' : 'Cash on Dispatch'}
                  </span>
                  {paymentMethod === 'COD' && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                </div>
                <span className="text-[10px] text-slate-500 leading-tight">
                  {language === 'ta' ? 'வாகனத்தில் சேகரிக்கும் போது பணம்' : 'Pay when pickup vehicle confirms'}
                </span>
              </button>
            </div>
          </div>

          {/* Escrow Guarantee Pill */}
          <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-start gap-2.5 text-xs text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div className="text-[11px] leading-relaxed">
              <span className="font-bold">
                {language === 'ta' ? '100% பாதுகாப்பான வர்த்தகம்: ' : '100% Escrow Protection: '}
              </span>
              {language === 'ta'
                ? 'விவசாயி பொருட்களை வாகனத்தில் அனுப்பி நீங்கள் தரத்தை சரிபார்க்கும் வரை உங்கள் பணம் எஸ்க்ரோ கணக்கில் பாதுகாப்பாக வைக்கப்படும்.'
                : 'Funds remain secured in KisanDirect Escrow until you inspect and verify the harvest upon delivery.'}
            </div>
          </div>

          {/* Bill Breakdown (Transparent 2% Platform Fee & Farmer Net Earnings) */}
          <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>{t('subtotal')}</span>
              <span className="font-semibold text-slate-900">₹{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>{t('deliveryFee')} ({t(deliveryMethod === 'STANDARD' ? 'standardDelivery' : deliveryMethod === 'EXPRESS' ? 'expressDelivery' : deliveryMethod === 'FARMER_DIRECT' ? 'farmerDirectDelivery' : 'selfPickup')})</span>
              <span className="font-semibold text-slate-900">
                {activeDeliveryFee === 0 ? (
                  <span className="text-emerald-700 font-bold">
                    {language === 'ta' ? 'இலவசம்' : 'FREE'}
                  </span>
                ) : (
                  `₹${activeDeliveryFee}`
                )}
              </span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Platform Service Fee (2% included)</span>
              <span>₹{platformFee}</span>
            </div>
            <div className="flex justify-between text-[11px] text-emerald-700 font-medium">
              <span>Farmer Direct Payout</span>
              <span>₹{farmerEarnings.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
              <span>{t('total')}</span>
              <span className="text-emerald-700">₹{grandTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <button
            onClick={handleConfirmOrder}
            disabled={isSubmitting || items.length === 0}
            className="w-full h-12 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 active:scale-98"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{language === 'ta' ? 'ஆர்டர் உறுதி செய்யப்படுகிறது...' : 'Confirming Order...'}</span>
              </>
            ) : (
              <>
                <span>{language === 'ta' ? 'ஆர்டரை உறுதி செய்' : 'Confirm Order'} • ₹{grandTotal.toLocaleString()}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
