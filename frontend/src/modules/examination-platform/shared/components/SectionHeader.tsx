import React from 'react';

interface SectionHeaderProps {
  title: string;
  description?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, description }) => {
  return (
    <div className="space-y-0.5 mb-4 text-left">
      <h3 className="text-sm md:text-base font-extrabold text-slate-800 font-display leading-tight">{title}</h3>
      {description && <p className="text-[11px] font-semibold text-slate-400">{description}</p>}
    </div>
  );
};
