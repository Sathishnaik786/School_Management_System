import { Router } from 'express';
import { TemplateController } from './controllers/template.controller';
import { TemplateLayoutController } from './controllers/TemplateLayoutController';
import { TemplateWorkflowController } from './controllers/TemplateWorkflowController';
import { TemplateAnalyticsController } from './controllers/TemplateAnalyticsController';
import { TemplateVersionController } from './controllers/TemplateVersionController';
import { checkPermission } from '../../../rbac/rbac.middleware';

export const templateBuilderRouter = Router();

// ==========================================
// ANALYTICS & METRICS
// ==========================================
templateBuilderRouter.get(
    '/analytics',
    checkPermission('assessment.template.analytics' as any),
    TemplateAnalyticsController.getMetrics
);

// ==========================================
// TEMPLATE LAYOUT & RENDER
// ==========================================
templateBuilderRouter.post(
    '/:id/layout',
    checkPermission('assessment.template.manage'),
    TemplateLayoutController.saveLayout
);

templateBuilderRouter.get(
    '/:id/preview',
    checkPermission('assessment.template.view'),
    TemplateLayoutController.getPreview
);

// ==========================================
// VALIDATION LOGS PIPELINE
// ==========================================
templateBuilderRouter.get(
    '/:id/validate',
    checkPermission('assessment.template.view'),
    TemplateController.validateTemplateRules
);

// ==========================================
// VERSIONS ROLLBACK & DIFFS
// ==========================================
templateBuilderRouter.get(
    '/:id/versions',
    checkPermission('assessment.template.view'),
    TemplateVersionController.getHistory
);

templateBuilderRouter.post(
    '/:id/versions/restore',
    checkPermission('assessment.template.manage'),
    TemplateVersionController.restoreVersion
);

// ==========================================
// STATUS WORKFLOW TRANSITION
// ==========================================
templateBuilderRouter.post(
    '/:id/workflow/transition',
    checkPermission('assessment.template.publish'),
    TemplateWorkflowController.transitionTemplate
);

// ==========================================
// GENERAL CRUD
// ==========================================
templateBuilderRouter.get(
    '/',
    checkPermission('assessment.template.view'),
    TemplateController.listTemplates
);

templateBuilderRouter.post(
    '/',
    checkPermission('assessment.template.manage'),
    TemplateController.createTemplate
);

templateBuilderRouter.get(
    '/:id',
    checkPermission('assessment.template.view'),
    TemplateController.getTemplateById
);

templateBuilderRouter.put(
    '/:id',
    checkPermission('assessment.template.manage'),
    TemplateController.updateTemplate
);

templateBuilderRouter.delete(
    '/:id',
    checkPermission('assessment.template.manage'),
    TemplateController.deleteTemplate
);

templateBuilderRouter.post(
    '/:id/sections',
    checkPermission('assessment.template.manage'),
    TemplateController.updateTemplateSections
);

templateBuilderRouter.post(
    '/:id/publish',
    checkPermission('assessment.template.publish'),
    TemplateController.publishTemplate
);

templateBuilderRouter.post(
    '/:id/clone',
    checkPermission('assessment.template.manage'),
    TemplateController.cloneTemplate
);

export default templateBuilderRouter;
