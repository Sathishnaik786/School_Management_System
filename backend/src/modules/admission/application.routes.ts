import { Router } from 'express';
import { checkPermission } from '../../rbac/rbac.middleware';
import { PERMISSIONS } from '../../rbac/permissions';
import { checkIdempotency } from '../../middleware/idempotency.middleware';
import { applicationController } from './index';

export const applicationRouter = Router();

// 1. Core Create & View
applicationRouter.post('/',
    checkPermission(PERMISSIONS.APPLICATION_CREATE),
    checkIdempotency,
    applicationController.create
);

applicationRouter.get('/:id',
    checkPermission(PERMISSIONS.APPLICATION_VIEW),
    applicationController.resume
);

// 2. Incremental PATCH Draft Sections
applicationRouter.patch('/:id/profile',
    checkPermission(PERMISSIONS.APPLICATION_UPDATE),
    applicationController.patchProfile
);

applicationRouter.patch('/:id/parents',
    checkPermission(PERMISSIONS.APPLICATION_UPDATE),
    applicationController.patchParents
);

applicationRouter.patch('/:id/education',
    checkPermission(PERMISSIONS.APPLICATION_UPDATE),
    applicationController.patchEducation
);

applicationRouter.patch('/:id/preferences',
    checkPermission(PERMISSIONS.APPLICATION_UPDATE),
    applicationController.patchPreferences
);

applicationRouter.patch('/:id/declaration',
    checkPermission(PERMISSIONS.APPLICATION_UPDATE),
    applicationController.patchDeclaration
);

// 3. Submit & Timeline
applicationRouter.post('/:id/submit',
    checkPermission(PERMISSIONS.APPLICATION_SUBMIT),
    checkIdempotency,
    applicationController.submit
);

applicationRouter.get('/:id/timeline',
    checkPermission(PERMISSIONS.APPLICATION_VIEW),
    applicationController.getTimeline
);

// 4. State Transition & Soft Delete
applicationRouter.post('/:id/transition',
    checkPermission(PERMISSIONS.APPLICATION_UPDATE),
    applicationController.transition
);

applicationRouter.delete('/:id',
    checkPermission(PERMISSIONS.APPLICATION_DELETE),
    applicationController.deleteDraft
);
