import React from 'react';
import { ExamRouteConfig } from './route-config';
import { ExamDashboardShell } from '../views/ExamDashboardShell';
import { ExamProfileShell } from '../views/ExamProfileShell';
import { ExamSettingsShell } from '../views/ExamSettingsShell';
import { ExamSessionShell } from '../views/ExamSessionShell';
import { ExamRole } from '../enums/ExamRole';

export const protectedDashboardRoutes: ExamRouteConfig[] = [
  {
    path: '/app/exams/dashboard',
    element: <ExamDashboardShell />,
    roles: Object.values(ExamRole),
  },
  {
    path: '/app/exams/profile',
    element: <ExamProfileShell />,
    roles: Object.values(ExamRole),
  },
  {
    path: '/app/exams/settings',
    element: <ExamSettingsShell />,
    roles: Object.values(ExamRole),
  },
];

export const protectedSessionRoutes: ExamRouteConfig[] = [
  {
    path: '/exam/session/:sessionId',
    element: <ExamSessionShell />,
    roles: [ExamRole.STUDENT, ExamRole.APPLICANT, ExamRole.RECRUITMENT_CANDIDATE],
  },
];
