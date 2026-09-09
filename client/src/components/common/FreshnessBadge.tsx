import React from 'react';
import { FreshnessStatus } from '../../types';
import { Clock, AlertTriangle, ShieldCheck, Flame, XCircle } from 'lucide-react';

interface FreshnessBadgeProps {
  status: FreshnessStatus;
  remainingText?: string;
  hoursRemaining?: number;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const FreshnessBadge: React.FC<FreshnessBadgeProps> = ({
  status,
  remainingText,
  showIcon = true,
  size = 'md',
}) => {
  const getStyles = () => {
    switch (status) {
      case 'FRESH':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
          icon: ShieldCheck,
          label: 'Fresh Harvest',
        };
      case 'AGING':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
          icon: Clock,
          label: 'Aging Batch',
        };
      case 'URGENT':
        return {
          bg: 'bg-orange-50 text-orange-700 border-orange-200 animate-pulse',
          dot: 'bg-orange-500',
          icon: Flame,
          label: 'Urgent Sale 🔥',
        };
      case 'EXPIRED':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500',
          icon: XCircle,
          label: 'Expired',
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
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  }[size];

  return (
    <div
      className={`inline-flex items-center font-medium rounded-full border ${style.bg} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      <span>{style.label}</span>
      {remainingText && (
        <span className="font-normal opacity-80 pl-0.5">· {remainingText}</span>
      )}
    </div>
  );
};

export default FreshnessBadge;
