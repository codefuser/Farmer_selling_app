import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import {
  Sprout,
  Bell,
  LogOut,
  Mic,
  TrendingUp,
  TrendingDown,
  Menu,
  X,
  MapPin,
  ShoppingCart,
  User as UserIcon,
  MessageCircle,
} from 'lucide-react';
import api from '../../services/api';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, params?: any) => void;
  onOpenVoiceModal: () => void;
  onOpenChat?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenVoiceModal,
  onOpenChat,
}) => {
  const { user, logout, notifications, unreadCount, refreshNotifications } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { cartCount, openCart } = useCart();
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
      .getMarketTicker('All')
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
        { id: 'home-feed', label: language === 'ta' ? 'விவசாய முகப்பு' : 'Farm Feed' },
        { id: 'landing', label: language === 'ta' ? 'அறிமுகம்' : 'About' },
        { id: 'market-rates', label: marketRatesLabel },
        { id: 'buyer-marketplace', label: t('marketplace') },
      ];
    }

    const homeFeedLink = { id: 'home-feed', label: language === 'ta' ? 'முகப்பு' : 'Home Feed' };

    switch (user.role) {
      case 'FARMER':
        return [
          homeFeedLink,
          { id: 'farmer-dashboard', label: t('dashboard') },
          { id: 'farmer-produce', label: t('myProduce') },
          { id: 'farmer-add-produce', label: t('addProduce') },
          { id: 'farmer-offers', label: t('buyerOffers') },
          { id: 'farmer-orders', label: t('myOrders') },
          { id: 'farmer-collective', label: t('collectiveSelling') },
          { id: 'farmer-earnings', label: t('myEarnings') },
        ];
      case 'BUYER':
        return [
          homeFeedLink,
          { id: 'buyer-dashboard', label: t('dashboard') },
          { id: 'buyer-marketplace', label: t('marketplace') },
          { id: 'buyer-post-demand', label: t('postDemand') },
          { id: 'buyer-smart-matches', label: t('smartMatches') },
          { id: 'buyer-orders', label: t('myOrders') },
        ];
      case 'COORDINATOR':
        return [
          homeFeedLink,
          { id: 'coordinator-dashboard', label: language === 'ta' ? 'கிராம மையம்' : 'Village Hub' },
          { id: 'market-rates', label: marketRatesLabel },
        ];
      case 'LOGISTICS':
        return [
          homeFeedLink,
          { id: 'logistics-dashboard', label: language === 'ta' ? 'விநியோகம் & தரம்' : 'Logistics & Quality' },
        ];
      case 'ADMIN':
        return [
          homeFeedLink,
          { id: 'admin-dashboard', label: language === 'ta' ? 'நிர்வாக புள்ளிவிவரம்' : 'Admin Analytics' },
        ];
      default:
        return [homeFeedLink];
    }
  };

  const links = getNavLinks();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-sm">
      {/* Sleek Minimal Live Vegetable Mandi Ticker */}
      <div
        onClick={() => onNavigate('market-rates')}
        className="bg-slate-900 text-slate-300 text-[11px] py-1.5 px-3 sm:px-4 border-b border-slate-800 cursor-pointer hover:bg-slate-850 transition-colors select-none"
        title="View live rates across Tamil Nadu markets"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 overflow-hidden">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold text-white uppercase tracking-wider text-[10px]">
              {t('dailyMandiRates')}
            </span>
            <span className="text-emerald-400 font-semibold hidden sm:inline text-[10px] bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
              {t('allTowns')} →
            </span>
          </div>

          {/* Running Rates Strip */}
          <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap text-xs">
            {ticker.map((item, idx) => (
              <div key={idx} className="inline-flex items-center gap-1 shrink-0">
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
            <span>
              {language === 'ta' ? 'நேரடி நியாய விலை: ' : 'Direct Fair Price: '}
              <strong className="text-emerald-300">
                {language === 'ta' ? '+15% கூடுதல் வருவாய்' : '+15% to Farmers'}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 sm:h-16 items-center">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate(user ? 'home-feed' : 'landing')}
              className="flex items-center gap-2 text-left group"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-sm transition-colors group-hover:bg-emerald-800 shrink-0">
                <Sprout className="w-5 h-5 text-emerald-100" />
              </div>
              <div>
                <span className="font-bold text-base sm:text-lg tracking-tight text-slate-900 block leading-tight">
                  KisanDirect
                </span>
                <span className="text-[10px] font-medium text-slate-500 hidden sm:block">
                  {t('appTagline')}
                </span>
              </div>
            </button>

            {/* Subtle Location Indicator */}
            <div className="hidden sm:flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100/70 border border-slate-200/80 px-2 py-0.5 rounded-full ml-2">
              <MapPin className="w-3 h-3 text-emerald-600" />
              <span>{t('locationSalem')}</span>
            </div>
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

            {/* Subtle Voice Listing Button for Farmer/Coordinator */}
            {(user?.role === 'FARMER' || user?.role === 'COORDINATOR') && (
              <button
                onClick={onOpenVoiceModal}
                className="ml-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
                title="Voice Listing"
              >
                <Mic className="w-3.5 h-3.5 text-emerald-700" />
                <span>{t('voiceListing')}</span>
              </button>
            )}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
              className="text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-200 transition select-none"
              title="Switch Language"
            >
              {language === 'en' ? 'தமிழ்' : 'EN'}
            </button>

            {/* Cart Icon (Buyer or Public) */}
            {(!user || user.role === 'BUYER') && (
              <button
                onClick={openCart}
                className="w-9 h-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center transition relative"
                title="Shopping Cart"
              >
                <ShoppingCart className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

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
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-100">
                      <span className="font-bold text-slate-900">
                        {t('notifications')} ({notifications.length})
                      </span>
                      <button
                        onClick={markAllRead}
                        className="text-[11px] text-emerald-700 hover:underline font-semibold"
                      >
                        {language === 'ta' ? 'அனைத்தும் படித்தவை' : 'Mark all read'}
                      </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-1.5">
                      {notifications.length === 0 ? (
                        <p className="text-slate-400 text-center py-5 text-xs">
                          {language === 'ta' ? 'அறிவிப்புகள் இல்லை' : 'No notifications yet'}
                        </p>
                      ) : (
                        notifications.slice(0, 8).map((n) => (
                          <div
                            key={n.id}
                            className={`p-2.5 rounded-xl transition ${
                              n.isRead ? 'bg-slate-50 text-slate-600' : 'bg-emerald-50 text-slate-800 font-medium'
                            }`}
                          >
                            <div className="font-bold text-xs text-slate-900">{n.title}</div>
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

            {/* Chat / Messages Button */}
            {user && onOpenChat && (
              <button
                onClick={onOpenChat}
                className="w-9 h-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center transition relative"
                title={language === 'ta' ? 'அரட்டை மற்றும் செய்திகள்' : 'Chat & Messages'}
              >
                <MessageCircle className="w-4 h-4 text-slate-700" />
              </button>
            )}

            {/* Profile Avatar / Auth Controls */}
            {user ? (
              <div className="flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 border-l border-slate-200">
                <button
                  onClick={() => onNavigate('profile')}
                  className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-slate-100 transition"
                  title="My Profile"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-right hidden lg:block">
                    <div className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">
                      {user.name}
                    </div>
                    <div className="text-[10px] font-bold text-emerald-700 uppercase flex items-center gap-1">
                      {user.activeRole ? (
                        user.activeRole === 'FARMER' ? '🌾 Farmer' : '🛒 Consumer'
                      ) : (
                        user.role
                      )}
                    </div>
                  </div>
                </button>

                <button
                  onClick={logout}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 flex items-center justify-center transition"
                  title={t('logout')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => onNavigate('login')}
                  className="text-xs font-bold text-slate-700 hover:text-slate-900 px-3 py-1.5 transition"
                >
                  {t('login')}
                </button>
                <button
                  onClick={() => onNavigate('register')}
                  className="text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-lg shadow-sm transition"
                >
                  {t('register')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
