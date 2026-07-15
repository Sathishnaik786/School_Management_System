import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useExamContext } from '../providers/ExamProvider';
import { ExamRole } from '../enums/ExamRole';

interface ExamRoleGuardProps {
  allowedRoles: ExamRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ExamRoleGuard: React.FC<ExamRoleGuardProps> = ({
  allowedRoles,
  children,
  fallback,
}) => {
  const { user } = useAuth();
  const { activeRole } = useExamContext();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isAllowed = allowedRoles.includes(activeRole);

  if (!isAllowed) {
    if (fallback) return <>{fallback}</>;
    return <Navigate to="/app/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ExamRoleGuard;
