import { BreadcrumbNode } from '../types/breadcrumb';

export const generateBreadcrumbs = (pathname: string): BreadcrumbNode[] => {
  const parts = pathname.split('/').filter(Boolean);
  const crumbs: BreadcrumbNode[] = [];

  let href = '';
  parts.forEach((part, index) => {
    href += `/${part}`;
    
    // Convert url segment to title casing and replace hyphens/underscores with spaces
    const label = part
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());

    crumbs.push({
      label,
      href: index === parts.length - 1 ? undefined : href,
      active: index === parts.length - 1,
    });
  });

  return crumbs;
};
