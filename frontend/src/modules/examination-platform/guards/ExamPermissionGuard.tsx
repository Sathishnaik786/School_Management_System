import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { PermissionCode } from '../enums/PermissionCode';
import { hasExamPermission } from '../utils/permissions';

interface ExamPermissionGuardProps {
  permission: PermissionCode | string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ExamPermissionGuard: React.FC<ExamPermissionGuardProps> = ({
  permission,
  children,
  fallback,
}) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isAllowed = hasExamPermission(user.permissions || [], permission, user.roles);

  if (!isAllowed) {
    if (fallback) return <>{fallback}</>;
    return <Navigate to="/app/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ExamPermissionGuard;
