import { SidebarItem } from '../types/navigation';
import { ExamRole } from '../enums/ExamRole';
import { hasExamPermission } from './permissions';

export const filterNavigationByAccess = (
  items: SidebarItem[],
  role: ExamRole,
  userPermissions: string[],
  userRoles: string[]
): SidebarItem[] => {
  return items
    .filter(item => {
      // Role filter
      if (item.roles && !item.roles.includes(role)) {
        return false;
      }
      // Permission filter
      if (item.permissions) {
        return item.permissions.some(p => hasExamPermission(userPermissions, p, userRoles));
      }
      return true;
    })
    .map(item => {
      if (item.children) {
        return {
          ...item,
          children: filterNavigationByAccess(item.children, role, userPermissions, userRoles),
        };
      }
      return item;
    });
};
