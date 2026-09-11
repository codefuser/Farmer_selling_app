import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  User,
  ShieldCheck,
  Star,
  MapPin,
  Building,
  Package,
  ShoppingBag,
  TrendingUp,
  Globe,
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';

interface ProfilePageProps {
  onNavigate: (view: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-800 mb-1">{t('login')}</h2>
        <p className="text-xs text-slate-500 mb-5">
          {language === 'ta'
            ? 'சுயவிவரத்தை பார்க்க உங்கள் கணக்கில் உள்நுழையவும்'
            : 'Please login to view your profile and account settings'}
        </p>
        <button
          onClick={() => onNavigate('login')}
          className="w-full h-12 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md"
        >
          {t('login')}
        </button>
      </div>
    );
  }

  const farmer = user.farmerProfile;
  const buyer = user.buyerProfile;

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-5">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-black text-slate-900 truncate">
                {user.name}
              </h1>
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            </div>
            <div className="text-[11px] font-bold text-emerald-700 uppercase mt-0.5">
              {user.role} · {language === 'ta' ? 'சரிபார்க்கப்பட்டது' : 'Verified'}
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              <span>{farmer?.village || buyer?.district || 'Salem'}, Tamil Nadu</span>
            </div>
          </div>
        </div>

        {/* Farmer Highlights */}
        {user.role === 'FARMER' && (
          <div className="grid grid-cols-3 gap-2 pt-4 mt-4 border-t border-slate-100 text-center">
            <div className="p-2 rounded-xl bg-slate-50">
              <div className="text-[10px] text-slate-500 font-medium">{language === 'ta' ? 'மதிப்பீடு' : 'Rating'}</div>
              <div className="text-xs font-bold text-slate-900 flex items-center justify-center gap-0.5 mt-0.5">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span>{farmer?.rating || 4.8}</span>
              </div>
            </div>
            <div className="p-2 rounded-xl bg-slate-50">
              <div className="text-[10px] text-slate-500 font-medium">{language === 'ta' ? 'ஆர்டர்கள்' : 'Orders'}</div>
              <div className="text-xs font-bold text-slate-900 mt-0.5">
                {farmer?.completedOrders || 24}
              </div>
            </div>
            <div className="p-2 rounded-xl bg-slate-50">
              <div className="text-[10px] text-slate-500 font-medium">{language === 'ta' ? 'நிலம்' : 'Land'}</div>
              <div className="text-xs font-bold text-emerald-700 mt-0.5">
                {farmer?.landSize || 2.5} ac
              </div>
            </div>
          </div>
        )}

        {/* Buyer Highlights */}
        {user.role === 'BUYER' && (
          <div className="grid grid-cols-2 gap-2 pt-4 mt-4 border-t border-slate-100 text-center">
            <div className="p-2 rounded-xl bg-slate-50">
              <div className="text-[10px] text-slate-500 font-medium">{language === 'ta' ? 'வணிக வகை' : 'Category'}</div>
              <div className="text-xs font-bold text-slate-900 mt-0.5">
                {buyer?.businessType || 'HOTEL'}
              </div>
            </div>
            <div className="p-2 rounded-xl bg-slate-50">
              <div className="text-[10px] text-slate-500 font-medium">{language === 'ta' ? 'வணிகப் பெயர்' : 'Business'}</div>
              <div className="text-xs font-bold text-emerald-700 truncate mt-0.5">
                {buyer?.businessName || 'Grand Hotel'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Account Navigation Links */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100 text-xs">
        {user.role === 'FARMER' && (
          <>
            <button
              onClick={() => onNavigate('farmer-produce')}
              className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition"
            >
              <span className="flex items-center gap-3 font-bold text-slate-800">
                <Package className="w-4 h-4 text-emerald-600" />
                <span>{t('myProduce')}</span>
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
            <button
              onClick={() => onNavigate('farmer-earnings')}
              className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition"
            >
              <span className="flex items-center gap-3 font-bold text-slate-800">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>{t('myEarnings')}</span>
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </>
        )}

        {user.role === 'BUYER' && (
          <>
            <button
              onClick={() => onNavigate('buyer-orders')}
              className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition"
            >
              <span className="flex items-center gap-3 font-bold text-slate-800">
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                <span>{t('myOrders')}</span>
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
            <button
              onClick={() => onNavigate('buyer-marketplace')}
              className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition"
            >
              <span className="flex items-center gap-3 font-bold text-slate-800">
                <Package className="w-4 h-4 text-emerald-600" />
                <span>{t('marketplace')}</span>
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </>
        )}

        {/* Language Selection Toggle */}
        <div className="p-4 flex items-center justify-between">
          <span className="flex items-center gap-3 font-bold text-slate-800">
            <Globe className="w-4 h-4 text-emerald-600" />
            <span>{language === 'ta' ? 'செயலி மொழி' : 'App Language'}</span>
          </span>
          <div className="flex bg-slate-100 rounded-lg p-0.5 text-[11px] font-bold">
            <button
              onClick={() => setLanguage('ta')}
              className={`px-2.5 py-1 rounded-md transition ${
                language === 'ta' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500'
              }`}
            >
              தமிழ்
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded-md transition ${
                language === 'en' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500'
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="w-full p-4 flex items-center justify-between text-rose-600 hover:bg-rose-50/50 transition font-bold"
        >
          <span className="flex items-center gap-3">
            <LogOut className="w-4 h-4" />
            <span>{t('logout')}</span>
          </span>
          <ChevronRight className="w-4 h-4 text-rose-300" />
        </button>
      </div>

      <div className="text-center text-[10px] text-slate-400 pt-2">
        KisanDirect · SIH 2026 Problem ID: SIH26033 · v1.0.0
      </div>
    </div>
  );
};

export default ProfilePage;
