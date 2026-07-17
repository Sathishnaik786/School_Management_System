import React from 'react';
import { ExamRouteConfig } from './route-config';
import { ExamDashboardShell, ExamProfileShell, ExamSettingsShell, ExamPlaceholderShell, ExamSessionShell, ExamAttemptShell } from '../views';
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
  {
    path: '/app/exams/student/attempt',
    element: <ExamAttemptShell />,
    roles: Object.values(ExamRole),
  },
  {
    path: '/app/exams/student/my-exams',
    element: <ExamPlaceholderShell />,
    roles: Object.values(ExamRole),
  },
  {
    path: '/app/exams/student/results',
    element: <ExamPlaceholderShell />,
    roles: Object.values(ExamRole),
  },
  {
    path: '/app/exams/teacher/schedule',
    element: <ExamPlaceholderShell />,
    roles: Object.values(ExamRole),
  },
  {
    path: '/app/exams/teacher/marks',
    element: <ExamPlaceholderShell />,
    roles: Object.values(ExamRole),
  },
  {
    path: '/app/exams/teacher/evaluations',
    element: <ExamPlaceholderShell />,
    roles: Object.values(ExamRole),
  },
  {
    path: '/app/exams/admin/timetable',
    element: <ExamPlaceholderShell />,
    roles: Object.values(ExamRole),
  },
  {
    path: '/app/exams/admin/questions',
    element: <ExamPlaceholderShell />,
    roles: Object.values(ExamRole),
  },
  {
    path: '/app/exams/admin/candidates',
    element: <ExamPlaceholderShell />,
    roles: Object.values(ExamRole),
  },
  {
    path: '/app/exams/admin/monitoring',
    element: <ExamPlaceholderShell />,
    roles: Object.values(ExamRole),
  },
  {
    path: '/app/exams/evaluator/queue',
    element: <ExamPlaceholderShell />,
    roles: Object.values(ExamRole),
  },
  {
    path: '/app/exams/evaluator/completed',
    element: <ExamPlaceholderShell />,
    roles: Object.values(ExamRole),
  },
  {
    path: '/app/exams/invigilator/monitoring',
    element: <ExamPlaceholderShell />,
    roles: Object.values(ExamRole),
  },
  {
    path: '/app/exams/invigilator/logs',
    element: <ExamPlaceholderShell />,
    roles: Object.values(ExamRole),
  },
  {
    path: '/app/exams/applicant/tests',
    element: <ExamPlaceholderShell />,
    roles: Object.values(ExamRole),
  },
  {
    path: '/app/exams/candidate/screening',
    element: <ExamPlaceholderShell />,
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
