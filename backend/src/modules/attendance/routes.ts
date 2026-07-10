import { Router } from 'express';
import { AttendanceSessionController } from './controllers/AttendanceSessionController';
import { AttendanceCaptureController } from './controllers/AttendanceCaptureController';
import { AttendanceWorkflowController } from './controllers/AttendanceWorkflowController';
import { LeaveManagementController } from './controllers/LeaveManagementController';
import { checkPermission } from '../../rbac/rbac.middleware';

export const attendanceRouter = Router();

// ==========================================
// ATTENDANCE SESSIONS
// ==========================================
attendanceRouter.get(
    '/sessions',
    checkPermission('attendance.view' as any),
    AttendanceSessionController.listSessions
);

attendanceRouter.post(
    '/sessions',
    checkPermission('attendance.manage' as any),
    AttendanceSessionController.createSession
);

// ==========================================
// CAPTURE CHECKINS
// ==========================================
attendanceRouter.post(
    '/mark',
    checkPermission('attendance.mark' as any),
    AttendanceCaptureController.markStudent
);

// ==========================================
// HOD APPROVALS
// ==========================================
attendanceRouter.post(
    '/workflow',
    checkPermission('attendance.manage' as any),
    AttendanceWorkflowController.transitionSession
);

// ==========================================
// LEAVE SCHEDULING
// ==========================================
attendanceRouter.post(
    '/leave',
    checkPermission('attendance.leave' as any),
    LeaveManagementController.submitLeave
);

attendanceRouter.post(
    '/leave/approve',
    checkPermission('attendance.leave' as any),
    LeaveManagementController.approveLeave
);

export default attendanceRouter;
