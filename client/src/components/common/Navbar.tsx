import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Sprout,
  Bell,
  LogOut,
  Mic,
  TrendingUp,
  TrendingDown,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import api from '../../services/api';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenVoiceModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenVoiceModal,
}) => {
  const { user, logout, notifications, unreadCount, refreshNotifications } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [ticker, setTicker] = useState<Array<{ name: string; nameTamil: string; price: number; trend: number; isRising: boolean }>>([
    { name: 'Tomato', nameTamil: 'தக்காளி', price: 26, trend: 2.4, isRising: true },
    { name: 'Onion', nameTamil: 'வெங்காயம்', price: 35, trend: -1.2, isRising: false },
    { name: 'Potato', nameTamil: 'உருளை', price: 24, trend: 0.5, isRising: true },
    { name: 'Drumstick', nameTamil: 'முருங்கை', price: 68, trend: 8.5, isRising: true },
    { name: 'Chilli', nameTamil: 'மிளகாய்', price: 50, trend: -2.0, isRising: false },
    { name: 'Carrot', nameTamil: 'கேரட்', price: 42, trend: 1.8, isRising: true },
    { name: 'Brinjal', nameTamil: 'கத்தரி', price: 34, trend: 3.1, isRising: true },
  ]);

  useEffect(() => {
    let mounted = true;
    api
      .getMarketTicker('Salem')
      .then((res) => {
        if (mounted && res && res.ticker && res.ticker.length > 0) {
          setTicker(res.ticker);
        }
      })
      .catch(() => {
        // Fallback ticker already initialized
      });
    return () => {
      mounted = false;
    };
  }, []);

  const markAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      await refreshNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const getNavLinks = () => {
    const marketRatesLabel = language === 'ta' ? 'மண்டி விலை' : 'Market Rates';

    if (!user) {
      return [
        { id: 'landing', label: language === 'ta' ? 'முகப்பு' : 'Home' },
        { id: 'market-rates', label: marketRatesLabel },
        { id: 'how-it-works', label: language === 'ta' ? 'எப்படி இயங்குகிறது' : 'How It Works' },
        { id: 'for-farmers', label: language === 'ta' ? 'விவசாயிகளுக்கு' : 'For Farmers' },
        { id: 'for-buyers', label: language === 'ta' ? 'வணிகர்களுக்கு' : 'For Buyers' },
      ];
    }

    switch (user.role) {
      case 'FARMER':
        return [
          { id: 'farmer-dashboard', label: t('dashboard') },
          { id: 'market-rates', label: marketRatesLabel },
          { id: 'farmer-produce', label: t('myProduce') },
          { id: 'farmer-add-produce', label: t('addProduce') },
          { id: 'farmer-offers', label: t('buyerOffers') },
          { id: 'farmer-orders', label: t('myOrders') },
          { id: 'farmer-collective', label: t('collectiveSelling') },
          { id: 'farmer-earnings', label: t('myEarnings') },
        ];
      case 'BUYER':
        return [
          { id: 'buyer-dashboard', label: 'Dashboard' },
          { id: 'market-rates', label: marketRatesLabel },
          { id: 'buyer-marketplace', label: 'Marketplace' },
          { id: 'buyer-post-demand', label: 'Post Demand' },
          { id: 'buyer-smart-matches', label: 'Smart Matches' },
          { id: 'buyer-offers', label: 'Negotiations' },
          { id: 'buyer-orders', label: 'Orders & Tracking' },
        ];
      case 'COORDINATOR':
        return [
          { id: 'coordinator-dashboard', label: 'Village Hub' },
          { id: 'market-rates', label: marketRatesLabel },
          { id: 'coordinator-register', label: 'Register Farmer' },
          { id: 'coordinator-create-batch', label: 'Add Batch for Farmer' },
        ];
      case 'LOGISTICS':
        return [
          { id: 'logistics-dashboard', label: 'Pickups & Deliveries' },
          { id: 'logistics-quality', label: 'Quality Verification' },
        ];
      case 'ADMIN':
        return [
          { id: 'admin-dashboard', label: 'Platform Analytics' },
          { id: 'market-rates', label: marketRatesLabel },
          { id: 'admin-disputes', label: 'Dispute Arbitration' },
          { id: 'impact', label: 'Impact Metrics' },
        ];
      default:
        return [];
    }
  };

  const links = getNavLinks();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-sm">
      {/* Sleek Minimal Live Vegetable Mandi Ticker (Clickable to open all towns page) */}
      <div
        onClick={() => onNavigate('market-rates')}
        className="bg-slate-900 text-slate-300 text-[11px] py-1.5 px-4 border-b border-slate-800 cursor-pointer hover:bg-slate-800/90 transition-colors"
        title="Click to view live vegetable rates across all Tamil Nadu towns"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-hidden">
          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold text-white uppercase tracking-wider text-[10px]">
              Daily Mandi Rates
            </span>
            <span className="text-emerald-400 font-semibold hidden sm:inline text-[10px] bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
              All Towns (அனைத்து ஊர்கள்) →
            </span>
          </div>

          {/* Running Rates Strip */}
          <div className="flex items-center gap-5 overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap text-xs">
            {ticker.map((item, idx) => (
              <div key={idx} className="inline-flex items-center gap-1.5 shrink-0">
                <span className="text-slate-300 font-medium">
                  {language === 'ta' ? item.nameTamil : item.name}
                </span>
                <span className="font-bold text-white">₹{item.price}/kg</span>
                <span
                  className={`inline-flex items-center text-[10px] font-semibold ${
                    item.isRising ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {item.isRising ? (
                    <TrendingUp className="w-3 h-3 mr-0.5 inline" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-0.5 inline" />
                  )}
                  {item.trend > 0 ? `+${item.trend}%` : `${item.trend}%`}
                </span>
              </div>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-2 shrink-0 text-[10px] text-slate-400">
            <span>Direct Fair Price: <strong className="text-emerald-300">+15% to Farmers</strong></span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate(user ? `${user.role.toLowerCase()}-dashboard` : 'landing')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-sm transition-colors group-hover:bg-emerald-800">
                <Sprout className="w-5 h-5 text-emerald-100" />
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight text-slate-900 block leading-tight">
                  KisanDirect
                </span>
                <span className="text-[10px] font-medium text-slate-500 block">
                  Direct Agricultural Marketplace
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  currentView === link.id
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            ))}

            {/* Subtle Voice Listing Button for Farmer */}
            {(user?.role === 'FARMER' || user?.role === 'COORDINATOR') && (
              <button
                onClick={onOpenVoiceModal}
                className="ml-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
                title="Voice Listing Simulation"
              >
                <Mic className="w-3.5 h-3.5 text-emerald-700" />
                <span>{t('voiceListing')}</span>
              </button>
            )}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
              className="text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100/80 hover:bg-slate-200/80 px-2.5 py-1.5 rounded-lg border border-slate-200 transition"
              title="Switch Language"
            >
              {language === 'en' ? 'தமிழ்' : 'English'}
            </button>

            {/* Notifications Dropdown */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                  className="w-9 h-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center transition relative"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifDropdown && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 text-xs">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                      <span className="font-semibold text-slate-900">Notifications ({notifications.length})</span>
                      <button
                        onClick={markAllRead}
                        className="text-[11px] text-emerald-700 hover:underline font-medium"
                      >
                        Mark all read
                      </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-1.5">
                      {notifications.length === 0 ? (
                        <p className="text-slate-400 text-center py-4 text-xs">No notifications yet</p>
                      ) : (
                        notifications.slice(0, 8).map((n) => (
                          <div
                            key={n.id}
                            className={`p-2.5 rounded-lg transition ${
                              n.isRead ? 'bg-slate-50 text-slate-600' : 'bg-emerald-50/70 text-slate-800 font-medium'
                            }`}
                          >
                            <div className="font-semibold text-xs text-slate-900">{n.title}</div>
                            <div className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">{n.message}</div>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Profile / Auth State */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-semibold text-slate-900 leading-tight truncate max-w-[130px]">
                    {user.name}
                  </div>
                  <div className="text-[10px] font-medium text-emerald-700 uppercase">
                    {user.role}
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 flex items-center justify-center transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('login')}
                  className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-1.5 transition"
                >
                  {t('login')}
                </button>
                <button
                  onClick={() => onNavigate('register')}
                  className="text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-lg shadow-sm transition"
                >
                  {t('register')}
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-9 h-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-600"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1">
          {links.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                onNavigate(link.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium ${
                currentView === link.id ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-600'
              }`}
            >
              {link.label}
            </button>
          ))}
          {(user?.role === 'FARMER' || user?.role === 'COORDINATOR') && (
            <button
              onClick={() => {
                onOpenVoiceModal();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 flex items-center gap-2 mt-2"
            >
              <Mic className="w-4 h-4" />
              <span>{t('voiceListing')}</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
