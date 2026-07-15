import { useLocation } from 'react-router-dom';
import { generateBreadcrumbs } from '../utils/breadcrumbs';

export const useBreadcrumbs = () => {
  const location = useLocation();
  const breadcrumbs = generateBreadcrumbs(location.pathname);

  return {
    breadcrumbs,
    currentPathname: location.pathname,
  };
};
