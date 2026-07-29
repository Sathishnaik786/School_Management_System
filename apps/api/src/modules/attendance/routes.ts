import { Router } from 'express';
import { AttendanceSessionController } from './controllers/AttendanceSessionController';
import { AttendanceCaptureController } from './controllers/AttendanceCaptureController';
import { AttendanceWorkflowController } from './controllers/AttendanceWorkflowController';
import { LeaveManagementController } from './controllers/LeaveManagementController';
import { checkPermission } from '../../rbac/rbac.middleware';

export const enterpriseAttendanceRouter = Router();

// ==========================================
// ATTENDANCE SESSIONS
// ==========================================
enterpriseAttendanceRouter.get(
    '/sessions',
    checkPermission('attendance.view' as any),
    AttendanceSessionController.listSessions
);

enterpriseAttendanceRouter.post(
    '/sessions',
    checkPermission('attendance.manage' as any),
    AttendanceSessionController.createSession
);

// ==========================================
// CAPTURE CHECKINS
// ==========================================
enterpriseAttendanceRouter.post(
    '/mark',
    checkPermission('attendance.mark' as any),
    AttendanceCaptureController.markStudent
);

// ==========================================
// HOD APPROVALS
// ==========================================
enterpriseAttendanceRouter.post(
    '/workflow',
    checkPermission('attendance.manage' as any),
    AttendanceWorkflowController.transitionSession
);

// ==========================================
// LEAVE SCHEDULING
// ==========================================
enterpriseAttendanceRouter.post(
    '/leave',
    checkPermission('attendance.leave' as any),
    LeaveManagementController.submitLeave
);

enterpriseAttendanceRouter.post(
    '/leave/approve',
    checkPermission('attendance.leave' as any),
    LeaveManagementController.approveLeave
);

export default enterpriseAttendanceRouter;
