import React from 'react';
import { NavLink } from 'react-router-dom';
import { GraduationCap, ChevronLeft, LogOut } from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';
import { useExamContext } from '../../providers/ExamProvider';
import { useExamLayoutContext } from '../../providers/ExamLayoutProvider';
import { SidebarMode } from '../../enums/SidebarMode';
import { ROLE_NAVIGATION_MAP } from '../../navigation';
import { filterNavigationByAccess } from '../../utils/navigation';
import { LAYOUT_CONFIG } from '../../config/layout.config';

export const Sidebar: React.FC = () => {
  const { user, signOut } = useAuth();
  const { activeRole } = useExamContext();
  const { sidebarMode, toggleSidebar, isMobile } = useExamLayoutContext();

  if (!user) return null;

  const rawMenu = ROLE_NAVIGATION_MAP[activeRole] || [];
  const menuItems = filterNavigationByAccess(
    rawMenu,
    activeRole,
    user.permissions || [],
    user.roles || []
  );

  const isCollapsed = sidebarMode === SidebarMode.COLLAPSED;
  const isHiddenMobile = isMobile && sidebarMode !== SidebarMode.FULL;

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobile && sidebarMode === SidebarMode.FULL && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm transition-all duration-300"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`bg-slate-900 text-slate-350 border-r border-slate-800 flex flex-col transition-all duration-300 z-50 ${
          isMobile
            ? `fixed top-0 bottom-0 left-0 w-64 transform ${
                sidebarMode === SidebarMode.FULL ? 'translate-x-0' : '-translate-x-full'
              }`
            : isCollapsed
            ? 'w-20'
            : 'w-64'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-premium-sm flex-shrink-0">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col text-left transition-opacity duration-300">
                <span className="font-display text-sm font-bold text-white leading-tight">
                  {LAYOUT_CONFIG.branding.name}
                </span>
                <span className="text-[9px] font-medium tracking-wide text-slate-500 uppercase leading-none mt-0.5">
                  {LAYOUT_CONFIG.branding.subText}
                </span>
              </div>
            )}
          </div>
          {!isMobile && !isCollapsed && (
            <button
              onClick={toggleSidebar}
              className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation list */}
        <nav className="flex-1 py-6 px-3.5 space-y-1.5 overflow-y-auto">
          {menuItems.map((item, index) => {
            const ItemIcon = item.icon;
            return (
              <NavLink
                key={index}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-premium-sm font-extrabold scale-[1.01]'
                      : 'hover:bg-slate-800/60 hover:text-white'
                  } ${isCollapsed ? 'justify-center px-0 w-11 h-11 mx-auto' : 'text-left'}`
                }
              >
                {ItemIcon && <ItemIcon className="w-4.5 h-4.5 flex-shrink-0" />}
                {!isCollapsed && <span className="truncate flex-1">{item.label}</span>}
                {!isCollapsed && item.badge && (
                  <span className="px-1.5 py-0.5 rounded bg-blue-500 text-[8px] font-black text-white leading-none">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="p-3.5 border-t border-slate-800/80">
          <button
            onClick={signOut}
            className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-xs font-bold text-rose-450 hover:bg-rose-950/20 hover:text-rose-400 transition-colors ${
              isCollapsed ? 'justify-center px-0 w-11 h-11 mx-auto' : 'text-left'
            }`}
          >
            <LogOut className="w-4.5 h-4.5 flex-shrink-0" />
            {!isCollapsed && <span className="truncate">Sign Out</span>}
          </button>
        </div>

      </aside>
    </>
  );
};
