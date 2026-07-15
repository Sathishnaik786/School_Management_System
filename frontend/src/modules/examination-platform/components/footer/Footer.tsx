import React from 'react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-slate-100/60 bg-white py-4 px-6 text-center text-[10px] font-bold text-slate-400">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
        <p>© {currentYear} EduTrack School Management System. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-slate-600 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-slate-600 transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};
