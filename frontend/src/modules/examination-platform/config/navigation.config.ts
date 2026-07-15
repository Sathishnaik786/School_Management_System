import { ROLE_NAVIGATION_MAP } from '../navigation';
import { SidebarMode } from '../enums/SidebarMode';

export const NAVIGATION_CONFIG = {
  defaultSidebarMode: SidebarMode.FULL,
  roleMenus: ROLE_NAVIGATION_MAP,
  enableNestedMenus: true,
  enablePermissionFiltering: true,
};
