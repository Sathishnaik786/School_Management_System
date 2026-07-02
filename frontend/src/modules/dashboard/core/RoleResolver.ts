import { DASHBOARD_CONSTANTS } from '../constants/DashboardConstants';

export class RoleResolver {
    public static resolve(rawRoles: string | string[]): string {
        const roles = Array.isArray(rawRoles) ? rawRoles : [rawRoles];
        const normalizedRoles = roles.map(r => r.toUpperCase());

        // Check priorities (e.g. if user is both admin and principal, admin takes precedence, etc.)
        if (normalizedRoles.includes('ADMIN')) return DASHBOARD_CONSTANTS.ROLES.ADMIN;
        
        if (normalizedRoles.includes('PRINCIPAL') || 
            normalizedRoles.includes('HOI') || 
            normalizedRoles.includes('HEAD_OF_INSTITUTE')) {
            return DASHBOARD_CONSTANTS.ROLES.PRINCIPAL;
        }

        if (normalizedRoles.includes('FINANCE_OFFICER') || 
            normalizedRoles.includes('ACCOUNTANT') ||
            normalizedRoles.includes('FINANCE')) {
            return DASHBOARD_CONSTANTS.ROLES.FINANCE;
        }

        if (normalizedRoles.includes('EXAM_CELL') || 
            normalizedRoles.includes('EXAM_CELL_ADMIN')) {
            return DASHBOARD_CONSTANTS.ROLES.EXAM_CELL;
        }

        if (normalizedRoles.includes('ADMISSION_OFFICER')) {
            return DASHBOARD_CONSTANTS.ROLES.ADMISSION_OFFICER;
        }

        if (normalizedRoles.includes('COUNSELOR') || 
            normalizedRoles.includes('COUNSELLOR')) {
            return DASHBOARD_CONSTANTS.ROLES.COUNSELOR;
        }

        if (normalizedRoles.includes('RECEPTIONIST') || 
            normalizedRoles.includes('FRONT_DESK')) {
            return DASHBOARD_CONSTANTS.ROLES.RECEPTIONIST;
        }

        if (normalizedRoles.includes('FACULTY') || 
            normalizedRoles.includes('TEACHER') ||
            normalizedRoles.includes('STAFF')) {
            return DASHBOARD_CONSTANTS.ROLES.FACULTY;
        }

        if (normalizedRoles.includes('PARENT') || 
            normalizedRoles.includes('GUARDIAN')) {
            return DASHBOARD_CONSTANTS.ROLES.PARENT;
        }

        if (normalizedRoles.includes('STUDENT')) {
            return DASHBOARD_CONSTANTS.ROLES.STUDENT;
        }

        // Fallback to faculty or standard student
        return DASHBOARD_CONSTANTS.ROLES.FACULTY;
    }
}

export default RoleResolver;
