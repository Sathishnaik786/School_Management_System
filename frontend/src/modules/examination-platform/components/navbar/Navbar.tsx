import React from 'react';
import { Menu, GraduationCap, Calendar, Shield } from 'lucide-react';
import { SearchBar } from '../search/SearchBar';
import { NotificationPanel } from '../notification/NotificationPanel';
import { ProfileDropdown } from '../profile/ProfileDropdown';
import { useExamLayoutContext } from '../../providers/ExamLayoutProvider';
import { useExamContext } from '../../providers/ExamProvider';
import { ExamRole } from '../../enums/ExamRole';

export const Navbar: React.FC = () => {
  const { toggleSidebar, isMobile } = useExamLayoutContext();
  const { activeRole, setActiveRole } = useExamContext();
  const [roleDropdownOpen, setRoleDropdownOpen] = React.useState(false);

  const roleLabels: Record<ExamRole, string> = {
    [ExamRole.STUDENT]: 'Student',
    [ExamRole.APPLICANT]: 'Applicant',
    [ExamRole.TEACHER]: 'Teacher',
    [ExamRole.EXAM_CELL]: 'Exam Cell',
    [ExamRole.EVALUATOR]: 'Evaluator',
    [ExamRole.INVIGILATOR]: 'Invigilator',
    [ExamRole.RECRUITMENT_CANDIDATE]: 'Candidate',
  };

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
        
        {/* Interactive Sandbox Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100 hover:border-slate-350 hover:shadow-premium-sm transition-all text-xs font-bold text-slate-700"
            aria-label="Switch examination role"
          >
            <Shield className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            <span className="capitalize">{roleLabels[activeRole]}</span>
            <span className="text-[8px] font-black text-blue-600 bg-blue-50 border border-blue-100 px-1 py-0.5 rounded leading-none uppercase scale-90">
              Demo
            </span>
          </button>

          {roleDropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setRoleDropdownOpen(false)} />
              <div className="absolute right-0 mt-2.5 w-[200px] bg-white border border-slate-200/80 rounded-2xl shadow-premium-xl py-2 z-50 text-left space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-3.5 py-1.5 border-b border-slate-100 pb-2">
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none">
                    Switch Sandbox Role
                  </p>
                  <p className="text-[8px] text-slate-405 font-bold leading-normal mt-1">
                    Toggle dynamic layouts instantly
                  </p>
                </div>
                <div className="px-1.5 space-y-0.5">
                  {Object.values(ExamRole).map((role) => {
                    const isSelected = activeRole === role;
                    return (
                      <button
                        key={role}
                        onClick={() => {
                          setActiveRole(role);
                          setRoleDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-blue-50 text-blue-600 font-extrabold'
                            : 'text-slate-700 hover:bg-slate-50 hover:text-blue-600'
                        }`}
                      >
                        <span className="capitalize">{roleLabels[role]}</span>
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        <NotificationPanel />
        <div className="w-px h-6 bg-slate-100 hidden sm:block" />
        <ProfileDropdown />
      </div>

    </header>
  );
};
