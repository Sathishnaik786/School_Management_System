import React from 'react';
import { ShieldAlert, X } from 'lucide-react';

interface AlertBannerProps {
  message: string;
  onClose?: () => void;
  variant?: 'warning' | 'danger' | 'info';
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  message,
  onClose,
  variant = 'warning',
}) => {
  const getStyle = () => {
    switch (variant) {
      case 'danger':
        return 'bg-rose-50 text-rose-800 border-rose-100';
      case 'info':
        return 'bg-blue-50 text-blue-800 border-blue-100';
      default:
        return 'bg-amber-50 text-amber-800 border-amber-100';
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'danger':
        return 'text-rose-600';
      case 'info':
        return 'text-blue-600';
      default:
        return 'text-amber-600';
    }
  };

  return (
    <div className={`flex items-center justify-between gap-3 p-3.5 border rounded-xl shadow-premium-sm text-left text-xs font-semibold ${getStyle()}`}>
      <div className="flex items-center gap-2.5">
        <ShieldAlert className={`w-4 h-4 flex-shrink-0 ${getIconColor()}`} />
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="hover:opacity-85 p-1 rounded-md text-slate-450 hover:bg-slate-100/50"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
