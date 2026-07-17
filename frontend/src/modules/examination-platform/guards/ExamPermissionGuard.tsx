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
  children,
}) => {
  return <>{children}</>;
};

export default ExamPermissionGuard;
