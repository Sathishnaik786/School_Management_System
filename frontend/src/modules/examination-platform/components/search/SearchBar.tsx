import React from 'react';
import { Search } from 'lucide-react';

export const SearchBar: React.FC = () => {
  return (
    <div className="relative max-w-xs w-full hidden md:block">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input
        type="text"
        placeholder="Search exam, code, date..."
        className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-600 focus:bg-white text-slate-800 font-semibold transition-all shadow-premium-sm"
      />
    </div>
  );
};
