import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

interface DashboardCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  description,
  children,
  footer,
  className = '',
}) => {
  return (
    <Card className={`bg-white border border-slate-200/80 rounded-2xl shadow-premium-sm hover:shadow-premium-md transition-all duration-300 ${className}`}>
      <CardHeader className="pb-4 text-left border-b border-slate-100/60">
        <CardTitle className="text-base font-bold text-slate-800 font-display">{title}</CardTitle>
        {description && <CardDescription className="text-xs text-slate-500">{description}</CardDescription>}
      </CardHeader>
      <CardContent className="pt-5">{children}</CardContent>
      {footer && <CardFooter className="pb-4 pt-0 border-t border-slate-100/60 text-xs text-slate-500">{footer}</CardFooter>}
    </Card>
  );
};
