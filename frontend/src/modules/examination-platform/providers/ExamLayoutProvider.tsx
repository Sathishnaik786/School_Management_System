import React, { createContext, useContext, useState, useEffect } from 'react';
import { SidebarMode } from '../enums/SidebarMode';
import { LAYOUT_CONFIG } from '../config/layout.config';

interface ExamLayoutContextType {
  sidebarMode: SidebarMode;
  setSidebarMode: (mode: SidebarMode) => void;
  toggleSidebar: () => void;
  isMobile: boolean;
}

const ExamLayoutContext = createContext<ExamLayoutContextType | undefined>(undefined);

export const ExamLayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>(LAYOUT_CONFIG.defaultSidebarMode);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < LAYOUT_CONFIG.mobileBreakpointPx;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarMode(SidebarMode.MOBILE);
      } else {
        setSidebarMode(LAYOUT_CONFIG.defaultSidebarMode);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // run initially
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    if (sidebarMode === SidebarMode.FULL) {
      setSidebarMode(SidebarMode.COLLAPSED);
    } else if (sidebarMode === SidebarMode.COLLAPSED) {
      setSidebarMode(SidebarMode.FULL);
    } else {
      // Toggle for mobile sidebar visibility could also toggle a sheet
      setSidebarMode(sidebarMode === SidebarMode.MOBILE ? SidebarMode.FULL : SidebarMode.MOBILE);
    }
  };

  return (
    <ExamLayoutContext.Provider value={{ sidebarMode, setSidebarMode, toggleSidebar, isMobile }}>
      {children}
    </ExamLayoutContext.Provider>
  );
};

export const useExamLayoutContext = () => {
  const context = useContext(ExamLayoutContext);
  if (!context) {
    throw new Error('useExamLayoutContext must be used within an ExamLayoutProvider');
  }
  return context;
};
