/**
 * Centralized permission and visibility resolver for Admissions module.
 * Consolidates role/permission checks previously duplicated across pages.
 */

export type AdmissionRole =
    | 'PARENT'
    | 'STUDENT'
    | 'RECEPTIONIST'
    | 'FRONT_DESK'
    | 'COUNSELOR'
    | 'COUNSELLOR'
    | 'ADMISSION_OFFICER'
    | 'EXAM_CELL'
    | 'EXAM_CELL_ADMIN'
    | 'PRINCIPAL'
    | 'HOI'
    | 'HEAD_OF_INSTITUTE'
    | 'FINANCE_OFFICER'
    | 'ACCOUNTANT'
    | 'ADMIN'
    | 'SUPERADMIN';

export interface PermissionContext {
    roles: string[];
    hasPermission: (permission: string) => boolean;
    hasRole: (role: string) => boolean;
}

const normalize = (role: string) => role.toUpperCase();

export const AdmissionPermissions = {
    isParent(ctx: PermissionContext): boolean {
        return ctx.roles.some(r => normalize(r) === 'PARENT');
    },

    isStudent(ctx: PermissionContext): boolean {
        return ctx.roles.some(r => normalize(r) === 'STUDENT');
    },

    isReceptionist(ctx: PermissionContext): boolean {
        return ctx.roles.some(r => ['RECEPTIONIST', 'FRONT_DESK'].includes(normalize(r)));
    },

    isCounselor(ctx: PermissionContext): boolean {
        return ctx.roles.some(r => ['COUNSELOR', 'COUNSELLOR'].includes(normalize(r)));
    },

    isAdmissionOfficer(ctx: PermissionContext): boolean {
        return ctx.roles.some(r => normalize(r) === 'ADMISSION_OFFICER');
    },

    isExamCell(ctx: PermissionContext): boolean {
        return ctx.roles.some(r => ['EXAM_CELL', 'EXAM_CELL_ADMIN'].includes(normalize(r)));
    },

    isPrincipal(ctx: PermissionContext): boolean {
        return ctx.roles.some(r =>
            ['PRINCIPAL', 'HOI', 'HEAD_OF_INSTITUTE'].includes(normalize(r))
        ) || ctx.hasPermission('admin.dashboard.view');
    },

    isFinance(ctx: PermissionContext): boolean {
        return ctx.roles.some(r => ['FINANCE_OFFICER', 'ACCOUNTANT'].includes(normalize(r)));
    },

    isStaff(ctx: PermissionContext): boolean {
        return (
            AdmissionPermissions.isAdmissionOfficer(ctx) ||
            AdmissionPermissions.isPrincipal(ctx) ||
            ctx.hasPermission('admin.dashboard.view') ||
            ctx.roles.some(r => normalize(r) === 'HOI')
        );
    },

    canViewApplication(ctx: PermissionContext): boolean {
        if (AdmissionPermissions.isReceptionist(ctx) && !AdmissionPermissions.isAdmissionOfficer(ctx)) {
            return false;
        }
        return (
            AdmissionPermissions.canReviewApplications(ctx) ||
            AdmissionPermissions.canViewOwnApplications(ctx) ||
            AdmissionPermissions.isCounselor(ctx) ||
            ctx.hasPermission('admission.application.view')
        );
    },

    canReviewApplications(ctx: PermissionContext): boolean {
        return ctx.hasPermission('admission.review') || AdmissionPermissions.isStaff(ctx);
    },

    canCreateApplication(ctx: PermissionContext): boolean {
        return ctx.hasPermission('admission.create') || AdmissionPermissions.isCounselor(ctx);
    },

    canViewOwnApplications(ctx: PermissionContext): boolean {
        return ctx.hasPermission('admission.view_own') || AdmissionPermissions.isParent(ctx);
    },

    canVerifyDocuments(ctx: PermissionContext): boolean {
        return AdmissionPermissions.isAdmissionOfficer(ctx) || AdmissionPermissions.isStaff(ctx);
    },

    canManageExams(ctx: PermissionContext): boolean {
        return AdmissionPermissions.isExamCell(ctx) || AdmissionPermissions.isPrincipal(ctx);
    },

    canManageInterviews(ctx: PermissionContext): boolean {
        return (
            AdmissionPermissions.isExamCell(ctx) ||
            AdmissionPermissions.isAdmissionOfficer(ctx) ||
            AdmissionPermissions.isPrincipal(ctx) ||
            ctx.hasPermission('admission.interview.manage')
        );
    },

    canEvaluateInterviews(ctx: PermissionContext): boolean {
        return (
            AdmissionPermissions.canManageInterviews(ctx) ||
            ctx.hasPermission('admission.interview.evaluate')
        );
    },

    canGenerateMerit(ctx: PermissionContext): boolean {
        return (
            AdmissionPermissions.isPrincipal(ctx) ||
            AdmissionPermissions.isAdmissionOfficer(ctx) ||
            ctx.hasPermission('admission.merit.generate')
        );
    },

    canManageMeritSelection(ctx: PermissionContext): boolean {
        return (
            AdmissionPermissions.canReviewApplications(ctx) ||
            AdmissionPermissions.isPrincipal(ctx) ||
            ctx.hasPermission('admission.merit.generate')
        );
    },

    canApproveOffers(ctx: PermissionContext): boolean {
        return AdmissionPermissions.isPrincipal(ctx) || AdmissionPermissions.isAdmissionOfficer(ctx);
    },

    canManageOffers(ctx: PermissionContext): boolean {
        return (
            AdmissionPermissions.isAdmissionOfficer(ctx) ||
            AdmissionPermissions.isPrincipal(ctx) ||
            ctx.hasPermission('admission.offer.manage')
        );
    },

    canSendOffers(ctx: PermissionContext): boolean {
        return AdmissionPermissions.canManageOffers(ctx);
    },

    canAcceptOffer(ctx: PermissionContext): boolean {
        return (
            AdmissionPermissions.isParent(ctx) ||
            AdmissionPermissions.canManageOffers(ctx) ||
            ctx.hasPermission('admission.view_own')
        );
    },

    canVerifyPayments(ctx: PermissionContext): boolean {
        return AdmissionPermissions.isFinance(ctx) || AdmissionPermissions.isPrincipal(ctx);
    },

    canCollectPayments(ctx: PermissionContext): boolean {
        return (
            AdmissionPermissions.isFinance(ctx) ||
            AdmissionPermissions.isAdmissionOfficer(ctx) ||
            AdmissionPermissions.isPrincipal(ctx)
        );
    },

    canManageWaivers(ctx: PermissionContext): boolean {
        return AdmissionPermissions.isFinance(ctx) || AdmissionPermissions.isPrincipal(ctx);
    },

    canViewFinance(ctx: PermissionContext): boolean {
        return (
            AdmissionPermissions.canCollectPayments(ctx) ||
            AdmissionPermissions.canVerifyPayments(ctx) ||
            AdmissionPermissions.isParent(ctx) ||
            ctx.hasPermission('admission.view_own')
        );
    },

    canEnroll(ctx: PermissionContext): boolean {
        return AdmissionPermissions.isAdmissionOfficer(ctx) || AdmissionPermissions.isPrincipal(ctx);
    },

    canViewEnrollment(ctx: PermissionContext): boolean {
        return (
            AdmissionPermissions.canEnroll(ctx) ||
            AdmissionPermissions.canReviewApplications(ctx) ||
            AdmissionPermissions.isParent(ctx) ||
            ctx.hasPermission('admission.view_own')
        );
    },

    canManageInquiries(ctx: PermissionContext): boolean {
        return (
            AdmissionPermissions.isReceptionist(ctx) ||
            AdmissionPermissions.isCounselor(ctx) ||
            AdmissionPermissions.isAdmissionOfficer(ctx)
        );
    },

    canAccessInquiryWorkspace(ctx: PermissionContext): boolean {
        return (
            ctx.hasPermission('admission.review') ||
            ctx.hasPermission('admission.enquiry.create') ||
            ctx.hasPermission('admission.enquiry.view') ||
            ctx.hasPermission('admission.leads.manage') ||
            ctx.hasPermission('admission.visitors.manage') ||
            AdmissionPermissions.canManageInquiries(ctx)
        );
    },

    canDecideLogin(ctx: PermissionContext): boolean {
        return ctx.hasPermission('manage_users') || AdmissionPermissions.isPrincipal(ctx);
    },

    resolveWorkspaceDashboard(ctx: PermissionContext): string {
        if (AdmissionPermissions.isParent(ctx)) return 'parent';
        if (AdmissionPermissions.isReceptionist(ctx)) return 'receptionist';
        if (AdmissionPermissions.isCounselor(ctx)) return 'counselor';
        if (AdmissionPermissions.isAdmissionOfficer(ctx)) return 'admission_officer';
        if (AdmissionPermissions.isExamCell(ctx)) return 'exam_cell';
        if (AdmissionPermissions.isPrincipal(ctx)) return 'principal';
        if (AdmissionPermissions.isFinance(ctx)) return 'finance';
        return 'generic';
    },
};
