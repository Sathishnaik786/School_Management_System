import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ActionCardProps {
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
  icon?: LucideIcon;
  iconBg?: string;
  iconColor?: string;
}

export const ActionCard: React.FC<ActionCardProps> = ({
  title,
  description,
  buttonText,
  onClick,
  icon: Icon,
  iconBg = 'bg-blue-50 border-blue-100',
  iconColor = 'text-blue-600',
}) => {
  return (
    <Card className="bg-white border border-slate-200/80 rounded-2xl shadow-premium-sm hover:shadow-premium-md transition-all duration-300">
      <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-left">
        <div className="flex gap-4 items-start">
          {Icon && (
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border flex-shrink-0 ${iconBg} ${iconColor}`}>
              <Icon className="w-6 h-6" />
            </div>
          )}
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-800 font-display leading-tight">{title}</h4>
            <p className="text-xs text-slate-500 max-w-lg leading-relaxed">{description}</p>
          </div>
        </div>
        <button
          onClick={onClick}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-premium-sm text-xs transition-all flex-shrink-0"
        >
          {buttonText}
        </button>
      </CardContent>
    </Card>
  );
};
