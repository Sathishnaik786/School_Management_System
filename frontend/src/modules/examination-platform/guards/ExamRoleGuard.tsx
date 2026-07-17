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
  children,
}) => {
  return <>{children}</>;
};

export default ExamRoleGuard;
