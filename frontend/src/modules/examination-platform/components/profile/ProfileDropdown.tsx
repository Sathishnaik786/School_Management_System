import React, { useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { ChevronDown, LogOut, User, Settings, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ProfileDropdown: React.FC = () => {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  // Resolve user avatar initials
  const initials = user.full_name
    ? user.full_name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user.email[0].toUpperCase();

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-150/40 transition-colors"
      >
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-xs font-black text-white shadow-premium-sm">
          {initials}
        </div>
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-bold text-slate-800 leading-tight">
            {user.full_name || 'User'}
          </span>
          <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide mt-0.5">
            {user.roles?.[0] || 'Member'}
          </span>
        </div>
        <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
      </button>

      {/* Popover Card */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          
          <div className="absolute right-0 mt-2.5 w-[200px] bg-white border border-slate-200/80 rounded-2xl shadow-premium-xl py-2 z-50 text-left space-y-1.5 animate-in fade-in slide-in-from-top-3 duration-250">
            {/* Header info */}
            <div className="px-3.5 py-1.5 border-b border-slate-100 pb-2">
              <p className="text-xs font-bold text-slate-800 truncate leading-tight">
                {user.full_name}
              </p>
              <p className="text-[10px] text-slate-405 truncate font-semibold">
                {user.email}
              </p>
            </div>

            {/* List options */}
            <div className="px-1.5 space-y-0.5">
              <Link
                to="/app/exams/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span>My Profile</span>
              </Link>
              <Link
                to="/app/exams/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Portal Settings</span>
              </Link>
              <Link
                to="/app/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-750 hover:text-blue-600 hover:bg-slate-50 transition-colors border-t border-slate-50 pt-2"
              >
                <Shield className="w-4 h-4 text-slate-400" />
                <span>Back to main ERP</span>
              </Link>
            </div>

            {/* Footer action */}
            <div className="px-1.5 border-t border-slate-100 pt-1.5">
              <button
                onClick={() => {
                  setIsOpen(false);
                  signOut();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50/50 transition-colors"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
