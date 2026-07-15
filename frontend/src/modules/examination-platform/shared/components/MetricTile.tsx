import React from 'react';

interface MetricTileProps {
  label: string;
  value: string | number;
  subLabel?: string;
  className?: string;
}

export const MetricTile: React.FC<MetricTileProps> = ({
  label,
  value,
  subLabel,
  className = '',
}) => {
  return (
    <div className={`p-4 bg-slate-50 border border-slate-200/80 rounded-xl text-left ${className}`}>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">
        {label}
      </p>
      <h4 className="text-xl font-extrabold text-slate-800 font-display leading-none mb-1">
        {value}
      </h4>
      {subLabel && (
        <p className="text-[10px] font-semibold text-slate-500 leading-none">
          {subLabel}
        </p>
      )}
    </div>
  );
};
