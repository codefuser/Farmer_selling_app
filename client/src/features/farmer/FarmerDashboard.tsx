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
  Sparkles,
  Flame,
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
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-slate-500">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-semibold">தகவல்கள் பதிவேற்றப்படுகின்றன... (Loading dashboard)</p>
      </div>
    );
  }

  const farmer = data?.farmer;
  const stats = data?.stats;
  const recentBatches = data?.recentBatches || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile & Greeting Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border-emerald-200/80 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-700/50 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-semibold text-emerald-200 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>{t('verifiedFarmer')} ✓ · ID: {farmer?.farmerId || 'FD-1024'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {language === 'ta' ? `வணக்கம், ${farmer?.name?.split(' ')[0]} 👋` : `Good Morning, ${farmer?.name} 👋`}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-emerald-100/90 mt-2">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-300" />
                {farmer?.village}, {farmer?.district}
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                {farmer?.rating || 4.8} / 5.0 (42 ஆர்டர்கள்)
              </span>
            </div>
          </div>

          {/* Direct CTA Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('farmer-add-produce')}
              className="px-4 py-2.5 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-extrabold text-xs shadow-lg transition flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('addProduce')}</span>
            </button>
            <button
              onClick={onOpenVoiceModal}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 backdrop-blur-md transition flex items-center gap-1.5"
            >
              <Mic className="w-4 h-4 text-emerald-300 animate-pulse" />
              <span>{t('voiceListing')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Urgent Freshness Warning Banner (If Urgent Batches Exist) */}
      {stats?.urgentBatchesCount > 0 && (
        <div className="bg-orange-50 border-2 border-orange-400/80 rounded-3xl p-5 text-orange-950 flex items-start gap-3 shadow-md animate-pulse">
          <Flame className="w-6 h-6 text-orange-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-extrabold text-sm">
              உடனடி விற்பனை எச்சரிக்கை! (Urgent Perishable Sale Mode Active)
            </h4>
            <p className="text-xs text-orange-900 mt-0.5 leading-relaxed">
              Your produce batch is approaching its sell-by deadline. The platform has prioritized your listing for nearby hotels and restaurants with a 15% discount recommendation to guarantee sale before expiry.
            </p>
          </div>
          <button
            onClick={() => onNavigate('farmer-produce')}
            className="px-3 py-1.5 bg-orange-600 text-white rounded-xl text-xs font-bold shrink-0 hover:bg-orange-500"
          >
            பார் (View)
          </button>
        </div>
      )}

      {/* Key Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>{t('activeBatches')}</span>
            <Package className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats?.activeBatchesCount || 0}</div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">
            {stats?.freshBatchesCount || 0} Fresh · {stats?.urgentBatchesCount || 0} Urgent
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>{t('buyerOffers')}</span>
            <Inbox className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats?.pendingOffersCount || 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            <button
              onClick={() => onNavigate('farmer-offers')}
              className="text-emerald-700 font-bold hover:underline"
            >
              Review offers & counter &rarr;
            </button>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>{t('availableQuantity')}</span>
            <ShoppingBag className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats?.totalAvailableQuantityKg || 0} <span className="text-sm font-bold text-slate-500">kg</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Ready for pickup</div>
        </div>

        <div className="glass-card rounded-2xl p-5 border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>{t('todaysEarnings')}</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">
            ₹{stats?.todayEarnings?.toLocaleString('en-IN') || '3,450'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Paid directly to bank</div>
        </div>
      </div>

      {/* Active Batches Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">{t('myProduce')}</h2>
            <p className="text-xs text-slate-500">விளைபொருட்களின் தரம் மற்றும் நேரடி நிலை (Real-Time Freshness)</p>
          </div>
          <button
            onClick={() => onNavigate('farmer-produce')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>அனைத்தும் பார் (View All)</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentBatches.map((batch: any) => (
            <div
              key={batch.id}
              className="glass-card rounded-2xl p-4 border-slate-200 hover:border-emerald-300 transition shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {batch.batchCode}
                  </span>
                  <FreshnessBadge
                    status={batch.freshnessStatus}
                    remainingText={batch.freshness?.formattedRemaining}
                  />
                </div>

                <div className="flex items-center gap-3 my-2">
                  <img
                    src={batch.imageUrl || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200'}
                    alt={batch.product?.name}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-100"
                  />
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">
                      {batch.product?.name} · {batch.product?.nameTamil}
                    </h3>
                    <div className="text-xs text-slate-600 mt-0.5">
                      கையிருப்பு: <strong className="text-slate-900">{batch.quantity} kg</strong> (Grade {batch.qualityGrade})
                    </div>
                    <div className="text-xs font-bold text-emerald-700 mt-0.5">
                      ₹{batch.pricePerKg} / kg
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">
                  அறுவடை: {new Date(batch.harvestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <button
                  onClick={() => onNavigate('farmer-offers')}
                  className="font-bold text-emerald-700 hover:underline"
                >
                  Offers பார் &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
