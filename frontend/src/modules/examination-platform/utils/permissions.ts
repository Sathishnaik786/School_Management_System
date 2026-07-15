import { PermissionCode } from '../enums/PermissionCode';

export const hasExamPermission = (
  userPermissions: string[],
  requiredPermission: PermissionCode | string,
  userRoles?: string[]
): boolean => {
  if (userRoles?.map(r => r.toUpperCase()).includes('SUPERADMIN')) {
    return true;
  }
  return userPermissions.includes(requiredPermission);
};
