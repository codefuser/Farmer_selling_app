import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Home,
  Package,
  Inbox,
  ShoppingBag,
  TrendingUp,
  Store,
  FileText,
  Layers,
  Truck,
  User,
} from 'lucide-react';

interface MobileBottomNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ currentView, onNavigate }) => {
  const { user } = useAuth();
  const { t } = useLanguage();

  if (!user) {
    return (
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 py-2 px-3 z-40 flex justify-around items-center text-[10px] font-semibold text-slate-600 shadow-lg">
        <button
          onClick={() => onNavigate('landing')}
          className={`flex flex-col items-center gap-1 ${currentView === 'landing' ? 'text-emerald-700 font-bold' : ''}`}
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </button>
        <button
          onClick={() => onNavigate('how-it-works')}
          className={`flex flex-col items-center gap-1 ${currentView === 'how-it-works' ? 'text-emerald-700 font-bold' : ''}`}
        >
          <Layers className="w-5 h-5" />
          <span>How It Works</span>
        </button>
        <button
          onClick={() => onNavigate('for-farmers')}
          className={`flex flex-col items-center gap-1 ${currentView === 'for-farmers' ? 'text-emerald-700 font-bold' : ''}`}
        >
          <Package className="w-5 h-5" />
          <span>For Farmers</span>
        </button>
        <button
          onClick={() => onNavigate('login')}
          className={`flex flex-col items-center gap-1 ${currentView === 'login' ? 'text-emerald-700 font-bold' : ''}`}
        >
          <User className="w-5 h-5" />
          <span>Login</span>
        </button>
      </div>
    );
  }

  if (user.role === 'FARMER') {
    return (
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 py-2 px-2 z-40 flex justify-around items-center text-[10px] font-semibold text-slate-600 shadow-lg">
        <button
          onClick={() => onNavigate('farmer-dashboard')}
          className={`flex flex-col items-center gap-1 ${currentView === 'farmer-dashboard' ? 'text-emerald-700 font-bold' : ''}`}
        >
          <Home className="w-5 h-5" />
          <span>{t('dashboard')}</span>
        </button>
        <button
          onClick={() => onNavigate('farmer-produce')}
          className={`flex flex-col items-center gap-1 ${currentView === 'farmer-produce' ? 'text-emerald-700 font-bold' : ''}`}
        >
          <Package className="w-5 h-5" />
          <span>{t('myProduce')}</span>
        </button>
        <button
          onClick={() => onNavigate('farmer-offers')}
          className={`flex flex-col items-center gap-1 ${currentView === 'farmer-offers' ? 'text-emerald-700 font-bold' : ''}`}
        >
          <Inbox className="w-5 h-5" />
          <span>Offers</span>
        </button>
        <button
          onClick={() => onNavigate('farmer-orders')}
          className={`flex flex-col items-center gap-1 ${currentView === 'farmer-orders' ? 'text-emerald-700 font-bold' : ''}`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span>Orders</span>
        </button>
        <button
          onClick={() => onNavigate('farmer-earnings')}
          className={`flex flex-col items-center gap-1 ${currentView === 'farmer-earnings' ? 'text-emerald-700 font-bold' : ''}`}
        >
          <TrendingUp className="w-5 h-5" />
          <span>Earnings</span>
        </button>
      </div>
    );
  }

  if (user.role === 'BUYER') {
    return (
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 py-2 px-2 z-40 flex justify-around items-center text-[10px] font-semibold text-slate-600 shadow-lg">
        <button
          onClick={() => onNavigate('buyer-dashboard')}
          className={`flex flex-col items-center gap-1 ${currentView === 'buyer-dashboard' ? 'text-emerald-700 font-bold' : ''}`}
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </button>
        <button
          onClick={() => onNavigate('buyer-marketplace')}
          className={`flex flex-col items-center gap-1 ${currentView === 'buyer-marketplace' ? 'text-emerald-700 font-bold' : ''}`}
        >
          <Store className="w-5 h-5" />
          <span>Market</span>
        </button>
        <button
          onClick={() => onNavigate('buyer-post-demand')}
          className={`flex flex-col items-center gap-1 ${currentView === 'buyer-post-demand' ? 'text-emerald-700 font-bold' : ''}`}
        >
          <FileText className="w-5 h-5" />
          <span>Post Demand</span>
        </button>
        <button
          onClick={() => onNavigate('buyer-smart-matches')}
          className={`flex flex-col items-center gap-1 ${currentView === 'buyer-smart-matches' ? 'text-emerald-700 font-bold' : ''}`}
        >
          <Layers className="w-5 h-5" />
          <span>Matches</span>
        </button>
        <button
          onClick={() => onNavigate('buyer-orders')}
          className={`flex flex-col items-center gap-1 ${currentView === 'buyer-orders' ? 'text-emerald-700 font-bold' : ''}`}
        >
          <Truck className="w-5 h-5" />
          <span>Orders</span>
        </button>
      </div>
    );
  }

  return null;
};

export default MobileBottomNav;
