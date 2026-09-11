import React from 'react';
import { FreshnessStatus } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { Clock, ShieldCheck, Flame, XCircle } from 'lucide-react';

interface FreshnessBadgeProps {
  status: FreshnessStatus;
  remainingText?: string;
  hoursRemaining?: number;
  minutesRemaining?: number;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const FreshnessBadge: React.FC<FreshnessBadgeProps> = ({
  status,
  remainingText,
  hoursRemaining,
  minutesRemaining,
  showIcon = true,
  size = 'md',
}) => {
  const { language } = useLanguage();

  const getStyles = () => {
    switch (status) {
      case 'FRESH':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
          icon: ShieldCheck,
          label: language === 'ta' ? 'புதிய அறுவடை' : 'Fresh Harvest',
        };
      case 'AGING':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
          icon: Clock,
          label: language === 'ta' ? 'பயன்படுத்த உகந்தது' : 'Aging Batch',
        };
      case 'URGENT':
        return {
          bg: 'bg-orange-50 text-orange-700 border-orange-200 animate-pulse',
          dot: 'bg-orange-500',
          icon: Flame,
          label: language === 'ta' ? 'விரைவு விற்பனை 🔥' : 'Urgent Sale 🔥',
        };
      case 'EXPIRED':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500',
          icon: XCircle,
          label: language === 'ta' ? 'காலாவதியானது' : 'Expired',
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
          icon: Clock,
          label: status,
        };
    }
  };

  const style = getStyles();
  const Icon = style.icon;

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  }[size];

  // If remainingText is not explicitly passed, but hours/minutes are
  const formattedTime =
    remainingText ||
    (hoursRemaining !== undefined
      ? language === 'ta'
        ? `${hoursRemaining} மணி ${minutesRemaining !== undefined ? `${minutesRemaining} நிமி` : ''}`
        : `${hoursRemaining}h ${minutesRemaining !== undefined ? `${minutesRemaining}m` : ''}`
      : undefined);

  return (
    <div
      className={`inline-flex items-center font-bold rounded-full border shadow-2xs ${style.bg} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      <span>{style.label}</span>
      {formattedTime && (
        <span className="font-semibold opacity-90 pl-0.5">· {formattedTime}</span>
      )}
    </div>
  );
};

export default FreshnessBadge;
