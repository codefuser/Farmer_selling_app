import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import {
  Home,
  Package,
  Inbox,
  ShoppingBag,
  Store,
  Truck,
  User,
  Users,
  Mic,
  ShieldCheck,
  BarChart3,
  Search,
  ShoppingCart,
  TrendingUp,
  MessageCircle,
} from 'lucide-react';

interface MobileBottomNavProps {
  currentView: string;
  onNavigate: (view: string, params?: any) => void;
  onOpenChat?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ currentView, onNavigate, onOpenChat }) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { cartCount, openCart } = useCart();

  // Navigation items by role
  const getNavItems = () => {
    if (!user) {
      return [
        { id: 'home-feed', label: language === 'ta' ? 'முகப்பு' : 'Feed', icon: Home },
        { id: 'market-rates', label: language === 'ta' ? 'மண்டி விலை' : 'Mandi', icon: TrendingUp },
        { id: 'buyer-marketplace', label: t('marketplace'), icon: Store },
        { id: 'login', label: t('login'), icon: User },
      ];
    }

    switch (user.role) {
      case 'FARMER':
        return [
          { id: 'home-feed', label: language === 'ta' ? 'முகப்பு' : 'Feed', icon: Home },
          { id: 'farmer-produce', label: language === 'ta' ? 'பொருட்கள்' : 'Produce', icon: Package },
          { id: 'farmer-offers', label: language === 'ta' ? 'வாய்ப்புகள்' : 'Offers', icon: Inbox },
          {
            id: 'chat',
            label: language === 'ta' ? 'அரட்டை' : 'Chat',
            icon: MessageCircle,
            onClick: () => onOpenChat && onOpenChat(),
          },
          { id: 'profile', label: t('profile'), icon: User },
        ];

      case 'BUYER':
        return [
          { id: 'home-feed', label: language === 'ta' ? 'முகப்பு' : 'Feed', icon: Home },
          { id: 'buyer-marketplace', label: language === 'ta' ? 'சந்தை' : 'Explore', icon: Store },
          {
            id: 'chat',
            label: language === 'ta' ? 'அரட்டை' : 'Chat',
            icon: MessageCircle,
            onClick: () => onOpenChat && onOpenChat(),
          },
          {
            id: 'cart',
            label: t('cart'),
            icon: ShoppingCart,
            badge: cartCount,
            onClick: () => openCart(),
          },
          { id: 'profile', label: t('profile'), icon: User },
        ];

      case 'COORDINATOR':
        return [
          { id: 'home-feed', label: language === 'ta' ? 'முகப்பு' : 'Feed', icon: Home },
          { id: 'coordinator-dashboard', label: language === 'ta' ? 'மையம்' : 'Hub', icon: Store },
          { id: 'coordinator-farmers', label: language === 'ta' ? 'விவசாயிகள்' : 'Farmers', icon: Users },
          {
            id: 'chat',
            label: language === 'ta' ? 'அரட்டை' : 'Chat',
            icon: MessageCircle,
            onClick: () => onOpenChat && onOpenChat(),
          },
          { id: 'profile', label: t('profile'), icon: User },
        ];

      case 'LOGISTICS':
        return [
          { id: 'home-feed', label: language === 'ta' ? 'முகப்பு' : 'Feed', icon: Home },
          { id: 'logistics-dashboard', label: language === 'ta' ? 'விநியோகம்' : 'Logistics', icon: Truck },
          { id: 'logistics-pickups', label: language === 'ta' ? 'சேகரிப்பு' : 'Pickups', icon: Package },
          { id: 'profile', label: t('profile'), icon: User },
        ];

      case 'ADMIN':
        return [
          { id: 'home-feed', label: language === 'ta' ? 'முகப்பு' : 'Feed', icon: Home },
          { id: 'admin-dashboard', label: language === 'ta' ? 'நிர்வாகம்' : 'Admin', icon: BarChart3 },
          { id: 'admin-users', label: language === 'ta' ? 'பயனர்கள்' : 'Users', icon: Users },
          { id: 'profile', label: t('profile'), icon: User },
        ];

      default:
        return [];
    }
  };

  const navItems = getNavItems();
  if (navItems.length === 0) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <div className="flex items-center justify-around h-14 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.onClick) {
                  item.onClick();
                } else {
                  onNavigate(item.id);
                }
              }}
              className={`flex-1 flex flex-col items-center justify-center py-1 relative min-h-[48px] rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-emerald-700 font-bold'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              {/* Icon Container with active indicator pill */}
              <div className="relative flex items-center justify-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    isActive ? 'bg-emerald-50 text-emerald-700 scale-105' : ''
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
                </div>

                {/* Badge if item has count (e.g. Cart) */}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-sm">
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Short localized label */}
              <span className="text-[10px] tracking-tight truncate max-w-[64px] mt-0.5 leading-none">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
