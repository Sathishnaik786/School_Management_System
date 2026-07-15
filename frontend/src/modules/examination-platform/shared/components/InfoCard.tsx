import React from 'react';
import { LucideIcon, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface InfoCardProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  variant?: 'info' | 'success' | 'warning' | 'error';
}

export const InfoCard: React.FC<InfoCardProps> = ({
  title,
  description,
  icon: Icon = Info,
  variant = 'info',
}) => {
  const getColors = () => {
    switch (variant) {
      case 'success':
        return {
          bg: 'bg-emerald-50 border-emerald-100',
          text: 'text-emerald-800',
          icon: 'text-emerald-600',
        };
      case 'warning':
        return {
          bg: 'bg-amber-50 border-amber-100',
          text: 'text-amber-800',
          icon: 'text-amber-600',
        };
      case 'error':
        return {
          bg: 'bg-rose-50 border-rose-100',
          text: 'text-rose-800',
          icon: 'text-rose-600',
        };
      default:
        return {
          bg: 'bg-blue-50 border-blue-100',
          text: 'text-blue-800',
          icon: 'text-blue-600',
        };
    }
  };

  const colors = getColors();

  return (
    <Card className={`border rounded-2xl ${colors.bg} shadow-none`}>
      <CardContent className="p-4 flex gap-3 text-left">
        <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${colors.icon}`} />
        <div className="space-y-1">
          <h4 className={`text-xs font-bold font-display uppercase tracking-wider ${colors.text}`}>{title}</h4>
          <p className={`text-xs leading-relaxed ${colors.text} opacity-90`}>{description}</p>
        </div>
      </CardContent>
    </Card>
  );
};
