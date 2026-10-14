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
  ShieldCheck,
  BarChart3,
  Search,
  ShoppingCart,
  TrendingUp,
  PlusCircle,
  FileText,
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

  // Navigation items by role - Flipkart / Amazon shopping model
  const getNavItems = () => {
    if (!user) {
      return [
        { id: 'buyer-marketplace', label: language === 'ta' ? 'அங்காடி' : 'Shop', icon: Store },
        { id: 'market-rates', label: language === 'ta' ? 'மண்டி விலை' : 'Mandi Rates', icon: TrendingUp },
        {
          id: 'cart',
          label: language === 'ta' ? 'கூடை' : 'Cart',
          icon: ShoppingCart,
          badge: cartCount,
          onClick: () => openCart(),
        },
        { id: 'login', label: language === 'ta' ? 'கணக்கு' : 'Account', icon: User },
      ];
    }

    switch (user.role) {
      case 'FARMER':
        return [
          { id: 'buyer-marketplace', label: language === 'ta' ? 'அங்காடி' : 'Shop', icon: Store },
          { id: 'farmer-add-produce', label: language === 'ta' ? 'சமர்ப்பிக்க' : 'Submit Produce', icon: PlusCircle },
          { id: 'farmer-produce', label: language === 'ta' ? 'என் பட்டியல்' : 'Submissions', icon: Package },
          { id: 'farmer-earnings', label: language === 'ta' ? 'கொள்முதல்' : 'Procurements', icon: FileText },
          { id: 'profile', label: language === 'ta' ? 'கணக்கு' : 'Account', icon: User },
        ];

      case 'BUYER':
      case 'CUSTOMER' as any:
        return [
          { id: 'buyer-marketplace', label: language === 'ta' ? 'அங்காடி' : 'Shop', icon: Store },
          { id: 'buyer-orders', label: language === 'ta' ? 'என் ஆர்டர்கள்' : 'My Orders', icon: Package },
          {
            id: 'cart',
            label: language === 'ta' ? 'கூடை' : 'Cart',
            icon: ShoppingCart,
            badge: cartCount,
            onClick: () => openCart(),
          },
          { id: 'market-rates', label: language === 'ta' ? 'மண்டி விலை' : 'Mandi', icon: TrendingUp },
          { id: 'profile', label: language === 'ta' ? 'கணக்கு' : 'Account', icon: User },
        ];

      case 'ADMIN':
        return [
          { id: 'buyer-marketplace', label: language === 'ta' ? 'அங்காடி' : 'Storefront', icon: Store },
          { id: 'admin-dashboard', label: language === 'ta' ? 'நிர்வாகம்' : 'Admin Hub', icon: BarChart3 },
          { id: 'market-rates', label: language === 'ta' ? 'மண்டி விலை' : 'Mandi', icon: TrendingUp },
          { id: 'profile', label: language === 'ta' ? 'கணக்கு' : 'Account', icon: User },
        ];

      case 'LOGISTICS':
      case 'DELIVERY_PARTNER' as any:
        return [
          { id: 'buyer-marketplace', label: language === 'ta' ? 'அங்காடி' : 'Shop', icon: Store },
          { id: 'logistics-dashboard', label: language === 'ta' ? 'விநியோகம்' : 'Delivery', icon: Truck },
          { id: 'profile', label: language === 'ta' ? 'கணக்கு' : 'Account', icon: User },
        ];

      default:
        return [
          { id: 'buyer-marketplace', label: language === 'ta' ? 'அங்காடி' : 'Shop', icon: Store },
          { id: 'profile', label: language === 'ta' ? 'கணக்கு' : 'Account', icon: User },
        ];
    }
  };

  const navItems = getNavItems();
  if (navItems.length === 0) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[max(0.4rem,env(safe-area-inset-bottom))]">
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
              {/* Icon Container with active indicator */}
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
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-extrabold flex items-center justify-center border-2 border-white shadow-sm">
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
