import { Router } from 'express';
import { AssessmentConfigurationController } from './controllers/AssessmentConfigurationController';
import { WorkflowController } from './controllers/WorkflowController';
import { checkPermission } from '../../../rbac/rbac.middleware';
import { PERMISSIONS } from '../../../rbac/permissions';

export const assessmentCoreRouter = Router();

// ==========================================
// ASSESSMENT CONFIGURATIONS ENDPOINTS
// ==========================================
assessmentCoreRouter.get('/configurations',
    checkPermission(PERMISSIONS.ASSESSMENT_CONFIGURATION_VIEW as any),
    AssessmentConfigurationController.listConfigurations
);

assessmentCoreRouter.get('/configurations/:id',
    checkPermission(PERMISSIONS.ASSESSMENT_CONFIGURATION_VIEW as any),
    AssessmentConfigurationController.getConfiguration
);

assessmentCoreRouter.post('/configurations',
    checkPermission(PERMISSIONS.ASSESSMENT_CONFIGURATION_MANAGE as any),
    AssessmentConfigurationController.createConfiguration
);

assessmentCoreRouter.put('/configurations/:id',
    checkPermission(PERMISSIONS.ASSESSMENT_CONFIGURATION_MANAGE as any),
    AssessmentConfigurationController.updateConfiguration
);

assessmentCoreRouter.delete('/configurations/:id',
    checkPermission(PERMISSIONS.ASSESSMENT_CONFIGURATION_MANAGE as any),
    AssessmentConfigurationController.deleteConfiguration
);

assessmentCoreRouter.post('/configurations/clone',
    checkPermission(PERMISSIONS.ASSESSMENT_CONFIGURATION_MANAGE as any),
    AssessmentConfigurationController.cloneConfiguration
);

assessmentCoreRouter.post('/configurations/reset',
    checkPermission(PERMISSIONS.ASSESSMENT_CONFIGURATION_MANAGE as any),
    AssessmentConfigurationController.resetConfiguration
);

assessmentCoreRouter.post('/configurations/validate',
    checkPermission(PERMISSIONS.ASSESSMENT_CONFIGURATION_MANAGE as any),
    AssessmentConfigurationController.validateConfiguration
);

// ==========================================
// WORKFLOW DEFINITIONS ENDPOINTS
// ==========================================
assessmentCoreRouter.get('/workflows',
    checkPermission(PERMISSIONS.ASSESSMENT_WORKFLOW_VIEW as any),
    WorkflowController.listWorkflows
);

assessmentCoreRouter.get('/workflows/:id',
    checkPermission(PERMISSIONS.ASSESSMENT_WORKFLOW_VIEW as any),
    WorkflowController.getWorkflow
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

// ==========================================
// WORKFLOW STEPS ENDPOINTS
// ==========================================
assessmentCoreRouter.get('/workflows/:id/steps',
    checkPermission(PERMISSIONS.ASSESSMENT_WORKFLOW_VIEW as any),
    WorkflowController.getSteps
);

assessmentCoreRouter.post('/workflows/:id/steps',
    checkPermission(PERMISSIONS.ASSESSMENT_WORKFLOW_MANAGE as any),
    WorkflowController.addStep
);

assessmentCoreRouter.put('/workflow-steps/:id',
    checkPermission(PERMISSIONS.ASSESSMENT_WORKFLOW_MANAGE as any),
    WorkflowController.updateStep
);

assessmentCoreRouter.delete('/workflow-steps/:id',
    checkPermission(PERMISSIONS.ASSESSMENT_WORKFLOW_MANAGE as any),
    WorkflowController.deleteStep
);

// ==========================================
// WORKFLOW TRANSITIONS ENDPOINTS
// ==========================================
assessmentCoreRouter.get('/workflows/:id/transitions',
    checkPermission(PERMISSIONS.ASSESSMENT_WORKFLOW_VIEW as any),
    WorkflowController.getTransitions
);

assessmentCoreRouter.post('/workflows/:id/transitions',
    checkPermission(PERMISSIONS.ASSESSMENT_WORKFLOW_MANAGE as any),
    WorkflowController.addTransition
);

assessmentCoreRouter.put('/workflow-transitions/:id',
    checkPermission(PERMISSIONS.ASSESSMENT_WORKFLOW_MANAGE as any),
    WorkflowController.updateTransition
);

assessmentCoreRouter.delete('/workflow-transitions/:id',
    checkPermission(PERMISSIONS.ASSESSMENT_WORKFLOW_MANAGE as any),
    WorkflowController.deleteTransition
);

export default assessmentCoreRouter;
