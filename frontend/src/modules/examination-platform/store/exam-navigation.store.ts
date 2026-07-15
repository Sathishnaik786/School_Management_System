import { create } from 'zustand';
import { SidebarMode } from '../enums/SidebarMode';

interface ExamNavigationState {
  sidebarMode: SidebarMode;
  setSidebarMode: (mode: SidebarMode) => void;
  isMobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const useExamNavigationStore = create<ExamNavigationState>((set) => ({
  sidebarMode: SidebarMode.FULL,
  setSidebarMode: (mode) => set({ sidebarMode: mode }),
  isMobileOpen: false,
  setMobileOpen: (open) => set({ isMobileOpen: open }),
}));
