import { useAuth } from '../../../context/AuthContext';
import { PermissionCode } from '../enums/PermissionCode';
import { hasExamPermission } from '../utils/permissions';

export const useExamPermissions = () => {
  const { user } = useAuth();

  const checkPermission = (requiredPermission: PermissionCode | string): boolean => {
    if (!user) return false;
    return hasExamPermission(user.permissions || [], requiredPermission, user.roles);
  };

  return {
    permissions: user?.permissions || [],
    checkPermission,
  };
};
