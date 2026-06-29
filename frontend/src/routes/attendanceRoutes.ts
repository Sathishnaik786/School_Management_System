import { ROUTES } from '../constants/routes';
import { PERMISSIONS } from '../constants/permissions';

export const ATTENDANCE_ROUTES_REGISTRY = [
    {
        path: ROUTES.ATTENDANCE.MARK,
        component: 'attendance/AttendanceMarking',
        permission: PERMISSIONS.ATTENDANCE.MARK,
    },
    {
        path: ROUTES.ATTENDANCE.LEAVES,
        component: 'attendance/AttendanceBridgeManager',
        permission: PERMISSIONS.ATTENDANCE.MARK,
    },
    {
        path: ROUTES.ATTENDANCE.MY_ATTENDANCE,
        component: 'attendance/MyAttendance',
        permission: PERMISSIONS.STUDENT.VIEW_SELF,
    }
];
