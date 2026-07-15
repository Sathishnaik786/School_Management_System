import { useAuth } from '../../../context/AuthContext';
import { useExamContext } from '../providers/ExamProvider';
import { ROLE_NAVIGATION_MAP } from '../navigation';
import { filterNavigationByAccess } from '../utils/navigation';
import { SidebarItem } from '../types/navigation';

export const useRoleNavigation = (): SidebarItem[] => {
  const { user } = useAuth();
  const { activeRole } = useExamContext();

  if (!user) return [];

  const rawMenu = ROLE_NAVIGATION_MAP[activeRole] || [];
  return filterNavigationByAccess(
    rawMenu,
    activeRole,
    user.permissions || [],
    user.roles || []
  );
};
