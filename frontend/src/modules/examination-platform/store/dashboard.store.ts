import { create } from 'zustand';
import { DashboardWidgetConfig } from '../types/dashboard';

interface DashboardState {
  widgets: DashboardWidgetConfig[];
  setWidgets: (widgets: DashboardWidgetConfig[]) => void;
  toggleWidgetVisibility: (id: string) => void;
}

export const useExamDashboardStore = create<DashboardState>((set) => ({
  widgets: [],
  setWidgets: (widgets) => set({ widgets }),
  toggleWidgetVisibility: (id) =>
    set((state) => ({
      widgets: state.widgets.map((w) =>
        w.id === id ? { ...w, visible: !w.visible } : w
      ),
    })),
}));
