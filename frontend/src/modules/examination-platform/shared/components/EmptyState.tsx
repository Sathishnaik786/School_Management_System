import React from 'react';
import { ClipboardCopy } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Data Available',
  description = 'There are no active records matching this portal scope at this time.',
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-12 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
        <ClipboardCopy className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-bold text-slate-800 font-display mb-1">{title}</h4>
      <p className="text-xs text-slate-500 max-w-sm mb-4 leading-normal">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};
