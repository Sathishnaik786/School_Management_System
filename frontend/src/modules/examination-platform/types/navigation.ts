import { LucideIcon } from 'lucide-react';
import { ExamRole } from '../enums/ExamRole';

export interface SidebarItem {
  label: string;
  href: string;
  icon?: LucideIcon;
  badge?: string | number;
  roles?: ExamRole[];
  permissions?: string[];
  children?: SidebarItem[];
}

export interface NavigationGroup {
  groupTitle: string;
  items: SidebarItem[];
}
