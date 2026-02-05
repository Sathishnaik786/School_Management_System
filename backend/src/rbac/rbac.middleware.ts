import { Request, Response, NextFunction } from 'express';
import { PermissionCode } from './permissions';

/**
 * Middleware to enforce RBAC permissions using cached context.
 */
export const checkPermission = (requiredPermission: PermissionCode) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // 1. Ensure Auth Middleware ran
        if (!req.context?.user) {
            return res.status(401).json({ error: 'Unauthorized: No session context' });
        }

        const { roles, permissions } = req.context.user;
        console.log(`[RBAC] User: ${req.context.user.email}, Required: ${requiredPermission}, Has: ${permissions.length} perms`);
        if (!permissions.includes(requiredPermission) && !roles.includes('ADMIN')) {
            console.log(`[RBAC] Permission Missing! User perms: ${JSON.stringify(permissions)}`);
        }

        // 2. Admin Bypass
        if (roles.includes('ADMIN')) {
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

        const userRoles = req.context.user.roles;
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

