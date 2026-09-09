import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Sprout,
  Bell,
  LogOut,
  User,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Mic,
  PlusCircle,
  Menu,
  X,
  Layers,
  Sparkles,
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

  const markAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      await refreshNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const getNavLinks = () => {
    if (!user) {
      return [
        { id: 'landing', label: 'Home' },
        { id: 'how-it-works', label: 'How It Works' },
        { id: 'for-farmers', label: 'For Farmers' },
        { id: 'for-buyers', label: 'For Buyers' },
        { id: 'impact', label: 'Impact' },
      ];
    }

    switch (user.role) {
      case 'FARMER':
        return [
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
          { id: 'buyer-dashboard', label: 'Dashboard' },
          { id: 'buyer-marketplace', label: 'Marketplace' },
          { id: 'buyer-post-demand', label: 'Post Demand' },
          { id: 'buyer-smart-matches', label: 'Smart Matches' },
          { id: 'buyer-offers', label: 'Negotiations' },
          { id: 'buyer-orders', label: 'Orders & Tracking' },
        ];
      case 'COORDINATOR':
        return [
          { id: 'coordinator-dashboard', label: 'Village Hub' },
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
          { id: 'admin-disputes', label: 'Dispute Arbitration' },
          { id: 'impact', label: 'Impact Metrics' },
        ];
      default:
        return [];
    }
  };

  const links = getNavLinks();

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-9 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate(user ? `${user.role.toLowerCase()}-dashboard` : 'landing')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-800 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition">
                <Sprout className="w-5 h-5 text-emerald-200" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-900 to-emerald-700 bg-clip-text text-transparent">
                  {t('appName')}
                </span>
                <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-widest block -mt-1">
                  {t('appTagline')}
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  currentView === link.id
                    ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {link.label}
              </button>
            ))}

            {/* Farmer Voice Listing Quick Button */}
            {(user?.role === 'FARMER' || user?.role === 'COORDINATOR') && (
              <button
                onClick={onOpenVoiceModal}
                className="ml-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <Mic className="w-3.5 h-3.5 text-emerald-200 animate-pulse" />
                <span>{t('voiceListing')}</span>
              </button>
            )}
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
              className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-xl border border-slate-200 transition"
              title="Switch Language (தமிழ் / English)"
            >
              {language === 'en' ? '🇮🇳 தமிழ்' : '🇬🇧 English'}
            </button>

            {/* Notifications Dropdown */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition relative"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Popover */}
                {showNotifDropdown && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 text-xs">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                      <span className="font-bold text-slate-900">Notifications ({notifications.length})</span>
                      <button
                        onClick={markAllRead}
                        className="text-[11px] text-emerald-700 hover:underline font-semibold"
                      >
                        Mark all read
                      </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {notifications.length === 0 ? (
                        <p className="text-slate-400 text-center py-4">No notifications yet</p>
                      ) : (
                        notifications.slice(0, 8).map((n) => (
                          <div
                            key={n.id}
                            className={`p-2 rounded-xl transition ${
                              n.isRead ? 'bg-slate-50 text-slate-600' : 'bg-emerald-50 text-emerald-900 font-medium'
                            }`}
                          >
                            <div className="font-semibold text-[11px]">{n.title}</div>
                            <div className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">{n.message}</div>
                            <span className="text-[9px] text-slate-400 mt-1 block">
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
              <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">
                    {user.name}
                  </div>
                  <div className="text-[10px] font-semibold text-emerald-700 leading-tight uppercase">
                    {user.role}
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="w-9 h-9 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('login')}
                  className="text-xs font-bold text-slate-700 hover:text-emerald-700 px-3 py-1.5 transition"
                >
                  {t('login')}
                </button>
                <button
                  onClick={() => onNavigate('register')}
                  className="text-xs font-bold bg-emerald-700 hover:bg-emerald-600 text-white px-3.5 py-1.5 rounded-xl shadow-sm transition"
                >
                  {t('register')}
                </button>
              </div>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-1">
          {links.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                onNavigate(link.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold ${
                currentView === link.id ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-700'
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
              className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold bg-emerald-700 text-white flex items-center gap-2"
            >
              <Mic className="w-4 h-4" />
              <span>{t('voiceListing')}</span>
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
