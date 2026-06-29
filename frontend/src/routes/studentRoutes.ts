import { ROUTES } from '../constants/routes';
import { PERMISSIONS } from '../constants/permissions';

export const STUDENT_ROUTES_REGISTRY = [
    {
        path: ROUTES.STUDENT.LIST,
        component: 'student/StudentList',
        permission: PERMISSIONS.STUDENT.VIEW,
    },
    {
        path: ROUTES.STUDENT.PROMOTE,
        component: 'student/StudentPromotion',
        permission: PERMISSIONS.STUDENT.ASSIGN_SECTION,
    },
    {
        path: ROUTES.STUDENT.MY_CHILDREN,
        component: 'student/MyChildren',
        permission: PERMISSIONS.STUDENT.VIEW_SELF,
    },
    {
        path: ROUTES.STUDENT.HISTORY,
        component: 'student/AcademicHistory',
        permission: PERMISSIONS.STUDENT.VIEW_SELF,
    }
];
