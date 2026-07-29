import { Router } from 'express';
import { BlueprintController } from './controllers/BlueprintController';
import { BlueprintWorkflowController } from './controllers/BlueprintWorkflowController';
import { BlueprintAnalyticsController } from './controllers/BlueprintAnalyticsController';
import { BlueprintVersionController } from './controllers/BlueprintVersionController';
import { checkPermission } from '../../../rbac/rbac.middleware';

export const blueprintRouter = Router();

// ==========================================
// METRICS & ANALYTICS
// ==========================================
blueprintRouter.get('/analytics',
    checkPermission('assessment.blueprint.analytics'),
    BlueprintAnalyticsController.getMetrics
);

// ==========================================
// RULES VALIDATION (Ad-hoc)
// ==========================================
blueprintRouter.post('/validate',
    checkPermission('assessment.blueprint.view'),
    BlueprintController.validateBlueprint
);

// ==========================================
// HISTORICAL TIMELINES & ROLLBACKS
// ==========================================
blueprintRouter.get('/:id/versions',
    checkPermission('assessment.blueprint.view'),
    BlueprintVersionController.getHistory
);

blueprintRouter.post('/:id/versions/restore',
    checkPermission('assessment.blueprint.update'),
    BlueprintVersionController.restoreVersion
);

// ==========================================
// WORKFLOW LIFECYCLE STATE CHANGE
// ==========================================
blueprintRouter.post('/:id/workflow/transition',
    checkPermission('assessment.blueprint.review'),
    BlueprintWorkflowController.transitionBlueprint
);

// ==========================================
// CLONING TRIGGER
// ==========================================
blueprintRouter.post('/:id/clone',
    checkPermission('assessment.blueprint.create'),
    BlueprintController.cloneBlueprint
);

// ==========================================
// CORE CRUD
// ==========================================
blueprintRouter.get('/',
    checkPermission('assessment.blueprint.view'),
    BlueprintController.listBlueprints
);

blueprintRouter.get('/:id',
    checkPermission('assessment.blueprint.view'),
    BlueprintController.getBlueprintById
);

blueprintRouter.post('/',
    checkPermission('assessment.blueprint.create'),
    BlueprintController.createBlueprint
);

blueprintRouter.put('/:id',
    checkPermission('assessment.blueprint.update'),
    BlueprintController.updateBlueprint
);

blueprintRouter.delete('/:id',
    checkPermission('assessment.blueprint.delete'),
    BlueprintController.deleteBlueprint
);

export default blueprintRouter;
