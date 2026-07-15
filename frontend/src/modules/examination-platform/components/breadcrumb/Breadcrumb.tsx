import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { generateBreadcrumbs } from '../../utils/breadcrumbs';

export const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const crumbs = generateBreadcrumbs(location.pathname);

  if (crumbs.length === 0) return null;

  return (
    <nav className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 py-2 text-left">
      <Link
        to="/app/exams/dashboard"
        className="flex items-center gap-1 hover:text-blue-600 transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
      </Link>
      
      {crumbs.map((crumb, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-3 h-3 text-slate-350" />
          {crumb.href ? (
            <Link
              to={crumb.href}
              className="hover:text-blue-600 transition-colors truncate max-w-[120px]"
            >
              {crumb.label}
            </Link>
          ) : (
            <span className="text-slate-800 truncate max-w-[120px]">{crumb.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
