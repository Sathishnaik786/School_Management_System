import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/sidebar/Sidebar';
import { Navbar } from '../components/navbar/Navbar';
import { Breadcrumb } from '../components/breadcrumb/Breadcrumb';
import { Footer } from '../components/footer/Footer';
import { ExamProvider } from '../providers/ExamProvider';
import { ExamLayoutProvider } from '../providers/ExamLayoutProvider';

export const ExamLayout: React.FC = () => {
  return (
    <ExamProvider>
      <ExamLayoutProvider>
        <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans antialiased text-slate-800">
          {/* Collapsible Sidebar */}
          <Sidebar />

          {/* Master Content Workspace */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
            {/* Sticky Header Nav */}
            <Navbar />

            {/* Content Area */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-between">
              <div className="space-y-4">
                {/* Dynamic Auto Breadcrumbs */}
                <Breadcrumb />
                
                {/* Nested Page Shell View */}
                <div className="animate-in fade-in duration-300">
                  <Outlet />
                </div>
              </div>

              {/* Institutional Footer */}
              <div className="mt-8">
                <Footer />
              </div>
            </main>
          </div>
        </div>
      </ExamLayoutProvider>
    </ExamProvider>
  );
};

export default ExamLayout;
