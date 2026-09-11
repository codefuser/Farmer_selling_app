import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import FreshnessBadge from '../../components/common/FreshnessBadge';
import {
  Package,
  Inbox,
  ShoppingBag,
  TrendingUp,
  PlusCircle,
  Mic,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Star,
  MapPin,
  ChevronRight,
  Flame,
  ArrowRight,
} from 'lucide-react';

interface FarmerDashboardProps {
  onNavigate: (view: string) => void;
  onOpenVoiceModal: () => void;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({
  onNavigate,
  onOpenVoiceModal,
}) => {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.getFarmerDashboard();
      setData(res);
    } catch (err) {
      console.error('Failed to load farmer dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center text-slate-500">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-bold">
          {language === 'ta' ? 'விவரங்கள் பதிவேற்றப்படுகின்றன...' : 'Loading farmer dashboard...'}
        </p>
      </div>
    );
  }

  const farmer = data?.farmer;
  const stats = data?.stats;
  const urgentBatches = data?.urgentBatches || [];
  const activeBatches = data?.activeBatches || [];
  const firstName = user?.name?.split(' ')[0] || (language === 'ta' ? 'விவசாயி' : 'Farmer');

  return (
    <div className="max-w-md sm:max-w-3xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Warm Header Greeting Card */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white rounded-3xl p-5 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-white/15 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-emerald-200 mb-1.5 backdrop-blur-sm">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t('verifiedFarmer')} · {farmer?.village || 'Salem'}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              {language === 'ta' ? `வணக்கம், ${firstName}!` : `Welcome, ${firstName}!`}
            </h1>
            <p className="text-xs text-emerald-100/90 mt-0.5">
              {language === 'ta'
                ? 'இன்றைய நேரடி சந்தை வாய்ப்புகளை கீழே காண்க'
                : 'Manage your harvests, live buyer offers and earnings'}
            </p>
          </div>

          <button
            onClick={onOpenVoiceModal}
            className="w-12 h-12 rounded-2xl bg-white text-emerald-800 flex flex-col items-center justify-center shadow-lg transition active:scale-95 shrink-0"
            title={t('voiceListing')}
          >
            <Mic className="w-5 h-5 text-emerald-700" />
            <span className="text-[9px] font-bold mt-0.5">{language === 'ta' ? 'குரல்' : 'Voice'}</span>
          </button>
        </div>
      </div>

      {/* 3 Quick Metric Boxes */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {/* Earnings */}
        <div
          onClick={() => onNavigate('farmer-earnings')}
          className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/90 shadow-xs cursor-pointer hover:border-emerald-300 transition"
        >
          <span className="text-[10px] sm:text-xs font-semibold text-slate-500 block leading-tight">
            {t('todaysEarnings')}
          </span>
          <span className="text-base sm:text-xl font-black text-emerald-700 block mt-1">
            ₹{(stats?.totalEarnings || 2300).toLocaleString()}
          </span>
        </div>

        {/* Available kg */}
        <div
          onClick={() => onNavigate('farmer-produce')}
          className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/90 shadow-xs cursor-pointer hover:border-emerald-300 transition"
        >
          <span className="text-[10px] sm:text-xs font-semibold text-slate-500 block leading-tight">
            {language === 'ta' ? 'விற்பனைக்கு' : 'For Sale'}
          </span>
          <span className="text-base sm:text-xl font-black text-slate-900 block mt-1">
            {stats?.totalQuantity || 100} kg
          </span>
        </div>

        {/* Offers */}
        <div
          onClick={() => onNavigate('farmer-offers')}
          className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/90 shadow-xs cursor-pointer hover:border-emerald-300 transition relative"
        >
          <span className="text-[10px] sm:text-xs font-semibold text-slate-500 block leading-tight">
            {t('buyerOffers')}
          </span>
          <span className="text-base sm:text-xl font-black text-emerald-800 block mt-1">
            {stats?.pendingOffersCount || 2}
          </span>
          {(stats?.pendingOffersCount || 0) > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          )}
        </div>
      </div>

      {/* Attention Needed: Urgent Produce Warning Card */}
      {urgentBatches.length > 0 && (
        <div className="bg-amber-50 border border-amber-300/80 rounded-2xl p-3.5 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="text-xs font-black text-amber-900">
              {t('attentionNeeded')}
            </span>
          </div>

          <div className="space-y-2">
            {urgentBatches.map((batch: any) => (
              <div
                key={batch.id}
                className="bg-white rounded-xl p-3 border border-amber-200 flex items-center justify-between gap-2"
              >
                <div>
                  <span className="font-bold text-xs text-slate-900 block">
                    {language === 'ta' ? batch.product?.nameTamil : batch.product?.name} · {batch.quantity} kg
                  </span>
                  <span className="text-[11px] text-amber-700 font-semibold block mt-0.5">
                    {language === 'ta' ? 'அவசர விற்பனை - தள்ளுபடியுடன்' : 'Urgent Sale - Auto Discounted'}
                  </span>
                </div>
                <button
                  onClick={() => onNavigate('farmer-produce')}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shrink-0"
                >
                  {language === 'ta' ? 'பார்க்க' : 'View'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Action Buttons (3 Big Touch Targets) */}
      <div>
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
          {t('quickActions')}
        </h2>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onNavigate('farmer-add-produce')}
            className="p-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex flex-col items-center justify-center gap-1.5 shadow-sm transition active:scale-95 text-center"
          >
            <PlusCircle className="w-5 h-5" />
            <span className="leading-tight">{t('addProduce')}</span>
          </button>

          <button
            onClick={onOpenVoiceModal}
            className="p-3.5 rounded-2xl bg-white border border-emerald-200 hover:bg-emerald-50 text-emerald-800 font-bold text-xs flex flex-col items-center justify-center gap-1.5 shadow-xs transition active:scale-95 text-center"
          >
            <Mic className="w-5 h-5 text-emerald-600" />
            <span className="leading-tight">{t('voiceListing')}</span>
          </button>

          <button
            onClick={() => onNavigate('farmer-orders')}
            className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs flex flex-col items-center justify-center gap-1.5 shadow-xs transition active:scale-95 text-center"
          >
            <ShoppingBag className="w-5 h-5 text-slate-700" />
            <span className="leading-tight">{t('myOrders')}</span>
          </button>
        </div>
      </div>

      {/* My Produce Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {t('myProduce')}
          </h2>
          <button
            onClick={() => onNavigate('farmer-produce')}
            className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
          >
            <span>{language === 'ta' ? 'அனைத்தும்' : 'View all'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {activeBatches.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 text-center text-slate-500">
            <Package className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-xs font-semibold">
              {language === 'ta' ? 'இன்னும் எந்த விளைபொருளும் சேர்க்கப்படவில்லை' : 'No active produce batches yet'}
            </p>
            <button
              onClick={() => onNavigate('farmer-add-produce')}
              className="mt-3 px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-xl"
            >
              + {t('addProduce')}
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {activeBatches.slice(0, 3).map((batch: any) => (
              <div
                key={batch.id}
                className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-200/90 shadow-xs flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 overflow-hidden shrink-0 border border-slate-100">
                    <img
                      src={batch.imageUrl || batch.product?.imageUrl}
                      alt={batch.product?.name}
                      className="w-full h-full object-cover"
                      onError={(e: any) => {
                        e.target.src = 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=200&q=80';
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-slate-900">
                      {language === 'ta' ? batch.product?.nameTamil : batch.product?.name}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span className="font-bold text-emerald-700">₹{batch.pricePerKg}/kg</span>
                      <span>·</span>
                      <span>{batch.quantity} kg</span>
                      <span>·</span>
                      <span className="bg-slate-100 px-1.5 py-0.2 rounded text-[10px] font-semibold text-slate-700">
                        {language === 'ta' ? `தரம் ${batch.qualityGrade}` : `Grade ${batch.qualityGrade}`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <FreshnessBadge
                    status={batch.freshnessStatus}
                    hoursRemaining={batch.freshness?.hoursRemaining}
                    minutesRemaining={batch.freshness?.minutesRemaining}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerDashboard;
