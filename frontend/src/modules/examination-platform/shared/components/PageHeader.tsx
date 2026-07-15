import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, action }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100/60 mb-6 text-left">
      <div className="space-y-1">
        <h2 className="text-2xl font-display font-extrabold text-slate-900 tracking-tight leading-tight">{title}</h2>
        {description && <p className="text-xs md:text-sm text-slate-500 font-medium">{description}</p>}
      </div>
      {action && <div className="flex-shrink-0 flex items-center gap-2">{action}</div>}
    </div>
  );
};
