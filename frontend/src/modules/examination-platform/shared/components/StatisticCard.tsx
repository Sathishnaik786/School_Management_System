import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatisticCardProps {
  title: string;
  value: string | number;
  changeDelta?: number;
  trendDirection?: 'up' | 'down' | 'neutral';
  icon?: LucideIcon;
  iconColor?: string;
  iconBg?: string;
}

export const StatisticCard: React.FC<StatisticCardProps> = ({
  title,
  value,
  changeDelta,
  trendDirection = 'neutral',
  icon: Icon,
  iconColor = 'text-blue-600',
  iconBg = 'bg-blue-50 border-blue-100',
}) => {
  return (
    <Card className="bg-white border border-slate-200/80 rounded-2xl shadow-premium-sm hover:shadow-premium-md transition-all duration-300">
      <CardContent className="p-6 flex items-center justify-between">
        <div className="space-y-2 text-left">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-display font-extrabold text-slate-900 leading-none">{value}</h3>
            {changeDelta !== undefined && (
              <span
                className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${
                  trendDirection === 'up'
                    ? 'text-emerald-700 bg-emerald-50'
                    : trendDirection === 'down'
                    ? 'text-rose-700 bg-rose-50'
                    : 'text-slate-600 bg-slate-100'
                }`}
              >
                {trendDirection === 'up' ? '+' : trendDirection === 'down' ? '-' : ''}
                {Math.abs(changeDelta)}%
              </span>
            )}
          </div>
        </div>
        {Icon && (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${iconBg} ${iconColor}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
