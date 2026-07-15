import { useExamNavigationStore } from '../store/exam-navigation.store';
import { SidebarMode } from '../enums/SidebarMode';

export const useExamNavigation = () => {
  const { sidebarMode, setSidebarMode, isMobileOpen, setMobileOpen } = useExamNavigationStore();

  const toggleSidebar = () => {
    if (sidebarMode === SidebarMode.FULL) {
      setSidebarMode(SidebarMode.COLLAPSED);
    } else {
      setSidebarMode(SidebarMode.FULL);
    }
  };

  return {
    sidebarMode,
    setSidebarMode,
    isMobileOpen,
    setMobileOpen,
    toggleSidebar,
  };
};
