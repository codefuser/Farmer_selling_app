import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import { Offer } from '../../types';
import {
  Inbox,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Clock,
  Star,
  MapPin,
  Building,
  TrendingUp,
  MessageSquare,
  AlertCircle,
  X,
} from 'lucide-react';

export const FarmerOffers: React.FC = () => {
  const { language, t } = useLanguage();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [counterModalOffer, setCounterModalOffer] = useState<Offer | null>(null);
  const [counterPrice, setCounterPrice] = useState('24');
  const [counterNotes, setCounterNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      setLoading(true);
      const res = await api.getFarmerOffers();
      setOffers(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (offerId: string) => {
    try {
      await api.acceptFarmerOffer(offerId);
      setStatusMsg(
        language === 'ta'
          ? 'விலை விருப்பம் ஏற்கப்பட்டது! ஆர்டர் செயலாக்கப்படுகிறது.'
          : 'Offer accepted successfully! Order is being processed.'
      );
      await loadOffers();
    } catch (err: any) {
      alert(err.message || 'Failed to accept offer');
    }
  };

  const handleReject = async (offerId: string) => {
    try {
      await api.rejectFarmerOffer(offerId);
      setStatusMsg(language === 'ta' ? 'விலை விருப்பம் நிராகரிக்கப்பட்டது.' : 'Offer rejected.');
      await loadOffers();
    } catch (err: any) {
      alert(err.message || 'Failed to reject offer');
    }
  };

  const handleSendCounter = async () => {
    if (!counterModalOffer) return;
    try {
      setIsSubmitting(true);
      await api.counterFarmerOffer(counterModalOffer.id, parseFloat(counterPrice), counterNotes);
      setCounterModalOffer(null);
      setStatusMsg(
        language === 'ta'
          ? 'வணிகருக்கு மாற்று விலை சலுகை அனுப்பப்பட்டது!'
          : 'Counter-offer sent to buyer!'
      );
      await loadOffers();
    } catch (err: any) {
      alert(err.message || 'Failed to send counter-offer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { en: string; ta: string; style: string }> = {
      ACCEPTED: {
        en: 'Accepted',
        ta: 'ஏற்கப்பட்டது',
        style: 'bg-emerald-100 text-emerald-800',
      },
      COUNTERED: {
        en: 'Countered',
        ta: 'மாற்று விலை அனுப்பப்பட்டது',
        style: 'bg-indigo-100 text-indigo-800',
      },
      REJECTED: {
        en: 'Rejected',
        ta: 'நிராகரிக்கப்பட்டது',
        style: 'bg-rose-100 text-rose-800',
      },
      PENDING: {
        en: 'Pending',
        ta: 'பரிசீலனையில்',
        style: 'bg-amber-100 text-amber-800',
      },
    };
    const conf = map[status] || { en: status, ta: status, style: 'bg-slate-100 text-slate-700' };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${conf.style}`}>
        {language === 'ta' ? conf.ta : conf.en}
      </span>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">{t('buyerOffers')}</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'ta'
              ? 'வணிகர்களிடமிருந்து பெறப்பட்ட நேரடி கொள்முதல் சலுகைகள் மற்றும் வெளிப்படையான பேரம்'
              : 'Direct buyer procurement offers and transparent counter-negotiation'}
          </p>
        </div>

        <button
          onClick={loadOffers}
          className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 transition"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {statusMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3 rounded-2xl text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{statusMsg}</span>
          </div>
          <button onClick={() => setStatusMsg(null)} className="text-xs font-bold text-slate-400 p-1">
            ✕
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">
            {language === 'ta' ? 'சலுகைகள் பெறப்படுகின்றன...' : 'Loading offers...'}
          </p>
        </div>
      ) : offers.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center text-slate-500 border border-slate-200 max-w-md mx-auto space-y-3">
          <Inbox className="w-12 h-12 mx-auto text-slate-300" />
          <h3 className="font-extrabold text-slate-800 text-sm">
            {language === 'ta' ? 'புதிய சலுகைகள் ஏதுமில்லை' : 'No offers received yet'}
          </h3>
          <p className="text-xs text-slate-500">
            {language === 'ta'
              ? 'உங்கள் சுற்றளவில் உள்ள வணிகர்கள் தேவைகளை உருவாக்கும் போது அவர்களின் சலுகைகள் இங்கு தோன்றும்.'
              : 'When buyers in your radius create matching demands, their direct offers will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {offers.map((offer) => {
            const cropName =
              language === 'ta'
                ? offer.batch?.product?.nameTamil || offer.batch?.product?.name
                : offer.batch?.product?.name;

            return (
              <div
                key={offer.id}
                className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 hover:border-emerald-300 transition shadow-sm space-y-3.5"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span className="font-black text-sm text-slate-900">
                      {offer.buyer?.businessName || (language === 'ta' ? 'வணிகக் கூட்டாளி' : 'Commercial Buyer')}
                    </span>
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full font-bold text-slate-600 flex items-center gap-0.5">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      4.8
                    </span>
                  </div>

                  {getStatusBadge(offer.status)}
                </div>

                {/* Offer Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 text-[10px] block font-semibold">
                      {language === 'ta' ? 'விளைபொருள்' : 'Product'}
                    </span>
                    <span className="font-extrabold text-slate-900">{cropName || 'Tomato'}</span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 text-[10px] block font-semibold">
                      {language === 'ta' ? 'கோரப்பட்ட அளவு' : 'Quantity'}
                    </span>
                    <span className="font-extrabold text-slate-900">{offer.quantity} kg</span>
                  </div>

                  <div className="bg-emerald-50 p-2.5 rounded-2xl border border-emerald-100">
                    <span className="text-emerald-700 text-[10px] block font-bold">
                      {language === 'ta' ? 'சலுகை விலை' : 'Offered Price'}
                    </span>
                    <span className="font-black text-emerald-900 text-sm">
                      ₹{offer.offeredPricePerKg} / kg
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 text-[10px] block font-semibold">
                      {language === 'ta' ? 'தொலைவு' : 'Distance'}
                    </span>
                    <span className="font-extrabold text-slate-900">
                      5.2 km {language === 'ta' ? 'தூரம்' : 'away'}
                    </span>
                  </div>
                </div>

                {/* Negotiation Turn History */}
                {offer.history && offer.history.length > 0 && (
                  <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 text-xs space-y-1.5">
                    <div className="font-bold text-slate-700 text-[11px] flex items-center gap-1">
                      <MessageSquare className="w-3 h-3 text-emerald-600" />
                      <span>{language === 'ta' ? 'பேச்சுவார்த்தை வரலாறு' : 'Negotiation History'}</span>
                    </div>
                    {offer.history.map((h) => (
                      <div
                        key={h.id}
                        className="flex justify-between items-center text-[11px] py-1 border-t border-slate-200/60"
                      >
                        <span className="text-slate-600">{h.notes}</span>
                        <span className="font-black text-slate-800">₹{h.pricePerKg}/kg</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Farmer Action Buttons */}
                {offer.status === 'PENDING' && (
                  <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                    <button
                      onClick={() => handleReject(offer.id)}
                      className="px-4 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition flex items-center gap-1 active:scale-95"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>{language === 'ta' ? 'நிராகரி' : 'Reject'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setCounterModalOffer(offer);
                        setCounterPrice(String(offer.offeredPricePerKg + 1));
                      }}
                      className="px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 hover:bg-indigo-100 text-xs font-bold transition flex items-center gap-1 active:scale-95"
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>{language === 'ta' ? 'மாற்று விலை அனுப்பு' : 'Counter Offer'}</span>
                    </button>

                    <button
                      onClick={() => handleAccept(offer.id)}
                      className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold shadow-sm transition flex items-center gap-1 active:scale-95"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>
                        {language === 'ta'
                          ? `ஏற்றுக்கொள் (₹${offer.offeredPricePerKg}/கிலோ)`
                          : `Accept (₹${offer.offeredPricePerKg}/kg)`}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Counter Offer Modal */}
      {counterModalOffer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">
                {language === 'ta' ? 'மாற்று விலை சலுகை' : 'Send Counter-Offer'}
              </h3>
              <button
                onClick={() => setCounterModalOffer(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              {language === 'ta'
                ? `வணிகர் ₹${counterModalOffer.offeredPricePerKg}/கிலோ கோரியுள்ளார். நீங்கள் விரும்பும் மாற்று விலையை உள்ளிடவும்:`
                : `Buyer proposed ₹${counterModalOffer.offeredPricePerKg}/kg. Enter your desired price per kilogram:`}
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'ta' ? 'உங்கள் மாற்று விலை / கிலோ (₹)' : 'Your Counter Price per kg (₹)'}
              </label>
              <input
                type="number"
                step="0.5"
                value={counterPrice}
                onChange={(e) => setCounterPrice(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-black text-emerald-800 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'ta' ? 'வணிகருக்கு குறிப்பு (விருப்பமானது)' : 'Notes for Buyer (optional)'}
              </label>
              <textarea
                value={counterNotes}
                onChange={(e) => setCounterNotes(e.target.value)}
                placeholder={
                  language === 'ta'
                    ? 'எ.கா. அதிகாலையில் பறிக்கப்பட்ட முதல் தரமான தக்காளி, தரமான பெட்டிகளில் பேக் செய்யப்பட்டுள்ளது.'
                    : 'e.g. Freshly harvested Grade A firm tomatoes packed in sanitized crates.'
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs outline-none h-18 resize-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCounterModalOffer(null)}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                {language === 'ta' ? 'ரத்து' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleSendCounter}
                disabled={isSubmitting}
                className="flex-1 py-2.5 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow transition"
              >
                {isSubmitting
                  ? (language === 'ta' ? 'அனுப்பப்படுகிறது...' : 'Sending...')
                  : (language === 'ta' ? 'மாற்று விலையை அனுப்பு' : 'Send Counter Offer')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerOffers;
