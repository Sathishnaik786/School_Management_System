import React from 'react';
import { Menu, GraduationCap, Calendar } from 'lucide-react';
import { SearchBar } from '../search/SearchBar';
import { NotificationPanel } from '../notification/NotificationPanel';
import { ProfileDropdown } from '../profile/ProfileDropdown';
import { useExamLayoutContext } from '../../providers/ExamLayoutProvider';

export const Navbar: React.FC = () => {
  const { toggleSidebar, isMobile } = useExamLayoutContext();

  return (
    <header className="h-16 w-full bg-white border-b border-slate-100/60 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      
      {/* Left side actions (Toggle button / Mobile branding logo) */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-slate-100/50 transition-colors"
          aria-label="Toggle navigation drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {isMobile && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-premium-sm">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-sm font-bold text-slate-900 leading-tight">
              EduTrack
            </span>
          </div>
        )}

        {/* Institutional info */}
        {!isMobile && (
          <div className="flex items-center gap-2 border-l border-slate-100 pl-4 text-xs font-semibold text-slate-500">
            <span className="text-slate-800 font-extrabold uppercase tracking-wide">Sunrise International School</span>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
            <div className="flex items-center gap-1 text-slate-450 font-bold">
              <Calendar className="w-3.5 h-3.5" />
              <span>A.Y. 2025-26</span>
            </div>
          </div>
        )}
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-4">
        <SearchBar />
        <NotificationPanel />
        <div className="w-px h-6 bg-slate-100 hidden sm:block" />
        <ProfileDropdown />
      </div>

    </header>
  );
};
