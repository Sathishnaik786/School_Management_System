import { GraduationCap } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const element = document.querySelector(href);
      if (element) {
        const offset = 80;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-12 gap-8 items-start">
          
          {/* Logo and Brand */}
          <div className="md:col-span-6 space-y-4 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-lg font-bold text-white leading-tight">
                  EduTrack
                </span>
                <span className="text-[10px] font-medium tracking-wide text-slate-400 uppercase">
                  Enterprise Examination Platform
                </span>
              </div>
            </div>
            
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              EduTrack Enterprise is a unified examination scheduling, secure proctoring, and grading architecture built for schools, departments, and academic institutions.
            </p>
          </div>

          {/* Links Grid */}
          <div className="md:col-span-6 grid grid-cols-2 gap-6 text-left">
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Portal Links</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a href="#home" onClick={(e) => handleLinkClick(e, "#home")} className="hover:text-blue-500 transition-colors">
                    Home Portal
                  </a>
                </li>
                <li>
                  <a href="#announcements" onClick={(e) => handleLinkClick(e, "#announcements")} className="hover:text-blue-500 transition-colors">
                    Important Notices
                  </a>
                </li>
                <li>
                  <a href="#supported-exams" onClick={(e) => handleLinkClick(e, "#supported-exams")} className="hover:text-blue-500 transition-colors">
                    Exam Categories
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Governance & Support</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a href="#" className="hover:text-blue-500 transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-500 transition-colors">
                    Terms & Conditions
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-500 transition-colors">
                    Accessibility Statement
                  </a>
                </li>
                <li>
                  <a href="/" className="hover:text-blue-500 transition-colors font-semibold text-slate-200">
                    Main School Website
                  </a>
                </li>
              </ul>
            </div>
          </div>

        </div>

        {/* Legal and Copyright */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
          <p>© {currentYear} EduTrack School ERP System. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="text-[10px] uppercase tracking-wider text-slate-500">Security Assured</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
