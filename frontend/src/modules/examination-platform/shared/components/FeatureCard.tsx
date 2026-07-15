import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconBg?: string;
  iconColor?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon: Icon,
  iconBg = 'bg-slate-50 border-slate-100',
  iconColor = 'text-slate-600',
}) => {
  return (
    <Card className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-premium-sm hover:shadow-premium-md hover:border-slate-350 transition-all duration-300 text-left">
      <CardContent className="p-0 space-y-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${iconBg} ${iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="font-display font-bold text-slate-800 text-sm md:text-base leading-tight">{title}</h4>
          <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
};
