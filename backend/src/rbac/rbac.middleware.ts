import { Request, Response, NextFunction } from 'express';
import { PermissionCode } from './permissions';

const ROLE_ALIASES: Record<string, string[]> = {
    'HEAD_OF_INSTITUTE': ['HOI', 'HEAD_OF_INSTITUTE', 'PRINCIPAL'],
    'HOI': ['HOI', 'HEAD_OF_INSTITUTE', 'PRINCIPAL'],
    'PRINCIPAL': ['HOI', 'HEAD_OF_INSTITUTE', 'PRINCIPAL'],
    'COUNSELLOR': ['COUNSELOR', 'COUNSELLOR'],
    'COUNSELOR': ['COUNSELOR', 'COUNSELLOR'],
    'ACCOUNTANT': ['FINANCE_OFFICER', 'ACCOUNTANT'],
    'FINANCE_OFFICER': ['FINANCE_OFFICER', 'ACCOUNTANT'],
    'DRIVER': ['BUS_DRIVER', 'DRIVER'],
    'BUS_DRIVER': ['BUS_DRIVER', 'DRIVER']
};

export const getEffectiveRoles = (roles: string[]): string[] => {
    const effective = new Set<string>();
    for (const role of roles) {
        effective.add(role);
        const aliases = ROLE_ALIASES[role];
        if (aliases) {
            aliases.forEach(alias => effective.add(alias));
        }
    }
    return Array.from(effective);
};

/**
 * Middleware to enforce RBAC permissions using cached context.
 */
export const checkPermission = (requiredPermission: PermissionCode) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // 1. Ensure Auth Middleware ran
        if (!req.context?.user) {
            return res.status(401).json({ error: 'Unauthorized: No session context' });
        }

        const permissions = req.context.user.permissions;
        const roles = getEffectiveRoles(req.context.user.roles);
        console.log(`[RBAC] User: ${req.context.user.email}, Required: ${requiredPermission}, Has: ${permissions.length} perms`);
        if (!permissions.includes(requiredPermission) && !roles.includes('ADMIN')) {
            console.log(`[RBAC] Permission Missing! User perms: ${JSON.stringify(permissions)}`);
        }

        // 2. Admin Bypass
        if (roles.includes('ADMIN')) {
            return next();
        }

        // 2b. Admission Officer Bypass for all admission module actions
        if (roles.includes('ADMISSION_OFFICER') && requiredPermission.startsWith('admission.')) {
            return next();
        }

        // 2c. Accountant Bypass for fee setup and payment collections
        if (roles.includes('ACCOUNTANT') && 
            (requiredPermission === 'admission.fees.manage' || requiredPermission === 'admission.payments.record')) {
            return next();
        }

        // 2d. HOI Bypass for offer approval and final enrollment confirmations
        if (roles.includes('HOI') && 
            (requiredPermission === 'admission.approve' || 
             requiredPermission === 'admission.reject' || 
             requiredPermission === 'admission.confirm.enroll')) {
            return next();
        }

        // 2e. Parent / Applicant Bypass for own application lifecycle actions
        if (roles.includes('PARENT') && 
            (requiredPermission === 'admission.view_own' || 
             requiredPermission === 'admission.create' || 
             requiredPermission === 'admission.update')) {
            return next();
        }

        // 2f. View Own / View All hierarchy fallback
        if (requiredPermission === 'admission.view_own' && 
            (permissions.includes('admission.view_all') || permissions.includes('admission.review'))) {
            return next();
        }

        // 3. Check Permission
        // 4. Check Role
        if (permissions.includes(requiredPermission)) {
            return next();
        }

        if (!permissions.includes(requiredPermission)) {
            console.error(`[RBAC] Denied. User ${req.context.user.email} (Roles: ${req.context.user.roles}) needs ${requiredPermission}. Has: ${permissions}`);
            return res.status(403).json({
                error: 'Forbidden: Insufficient Permissions',
                required: requiredPermission,
                has: permissions,
                user: req.context.user.email,
                roles: req.context.user.roles
            });
        }
    };
};

/**
 * Middleware to enforce Role-based access.
 * Returns 403 if user does not have ANY of the required roles.
 */
export const checkRole = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.context?.user) {
            return res.status(401).json({ error: 'Unauthorized: No session context' });
        }

        const userRoles = getEffectiveRoles(req.context.user.roles);
        const hasRole = userRoles.some(r => allowedRoles.includes(r));

        if (hasRole || userRoles.includes('ADMIN')) {
            return next();
        }

        console.error(`[RBAC] Role Denied. Required: ${allowedRoles}. User has: ${userRoles}`);
        return res.status(403).json({
            error: 'Forbidden: Insufficient Permissions',
            required_roles: allowedRoles,
            user_roles: userRoles
        });
    };
};

// Alias for compatibility if needed (user prompt called it "checkPermission", previous file was "requirePermission")
export const requirePermission = checkPermission;
export const requireRole = checkRole;

