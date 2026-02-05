import { Router } from 'express';
import { checkPermission } from '../../rbac/rbac.middleware';
import { PERMISSIONS } from '../../rbac/permissions';
import { StaffController } from './staff.controller';

export const staffRouter = Router();

// GET /admin/staff-profiles
// We mount this router at /admin (if possible) or include path here
// Assuming mounted at /admin for this example, but standard app layout might be different
// If mounted at /staff in main routes:
// router.get('/profiles', ...)

/* 
   NOTE: Since we need to mount this at a top level location,
   and we are defining it as a module.
   We will assume the main router mounts this at `/staff` or `/admin`.
   Given the requirement "GET /admin/staff-profiles", we will structure paths here
   assuming the mount point is generic or we define full path.
   
   However, usually modules are mounted at `/api/module`.
   If I mount this at `/api/admin`, then paths below are `/staff-profiles`.
*/

// ADMIN ONLY
staffRouter.get('/staff-profiles',
    checkPermission(PERMISSIONS.STAFF_PROFILE_MANAGE),
    StaffController.getAllProfiles
);

staffRouter.post('/staff-profiles',
    checkPermission(PERMISSIONS.STAFF_PROFILE_MANAGE),
    StaffController.createProfile
);

staffRouter.put('/staff-profiles/:id',
    checkPermission(PERMISSIONS.STAFF_PROFILE_MANAGE),
    StaffController.updateProfile
);

staffRouter.patch('/staff-profiles/:id/status',
    checkPermission(PERMISSIONS.STAFF_PROFILE_MANAGE),
    StaffController.updateStatus
);
