import React from 'react';
import { ExamRouteConfig } from './route-config';
import { ExamHelpShell } from '../views/ExamHelpShell';
import { ExamHallTicketVerificationShell } from '../views/ExamHallTicketVerificationShell';

export const publicRoutes: ExamRouteConfig[] = [
  {
    path: '/exam/help',
    element: <ExamHelpShell />,
  },
  {
    path: '/exam/hall-ticket-verification',
    element: <ExamHallTicketVerificationShell />,
  },
];
