import { Router } from 'express';
import { ConfigController } from './controllers/config.controller';
import { WorkflowController } from './controllers/workflow.controller';
import { checkPermission } from '../../../rbac/rbac.middleware';
import { PERMISSIONS } from '../../../rbac/permissions';

export const assessmentCoreRouter = Router();

// ==========================================
// CONFIGURATIONS ENDPOINTS
// ==========================================
assessmentCoreRouter.get('/config',
    checkPermission(PERMISSIONS.ASSESSMENT_CONFIG_VIEW as any),
    ConfigController.getConfig
);

assessmentCoreRouter.put('/config',
    checkPermission(PERMISSIONS.ASSESSMENT_CONFIG_MANAGE as any),
    ConfigController.updateConfig
);

// ==========================================
// WORKFLOWS CRUDS
// ==========================================
assessmentCoreRouter.get('/workflows',
    checkPermission(PERMISSIONS.ASSESSMENT_WORKFLOW_MANAGE as any),
    WorkflowController.listWorkflows
);

assessmentCoreRouter.get('/workflows/:id',
    checkPermission(PERMISSIONS.ASSESSMENT_WORKFLOW_MANAGE as any),
    WorkflowController.getWorkflowById
);

assessmentCoreRouter.post('/workflows',
    checkPermission(PERMISSIONS.ASSESSMENT_WORKFLOW_MANAGE as any),
    WorkflowController.createWorkflow
);

assessmentCoreRouter.put('/workflows/:id',
    checkPermission(PERMISSIONS.ASSESSMENT_WORKFLOW_MANAGE as any),
    WorkflowController.updateWorkflow
);

assessmentCoreRouter.delete('/workflows/:id',
    checkPermission(PERMISSIONS.ASSESSMENT_WORKFLOW_MANAGE as any),
    WorkflowController.deleteWorkflow
);
export default assessmentCoreRouter;
