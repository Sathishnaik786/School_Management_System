import { Router } from 'express';
import { TemplateController } from './controllers/template.controller';
import { authenticate } from '../../../auth/auth.middleware';
import { checkPermission } from '../../../rbac/rbac.middleware';

export const templateBuilderRouter = Router();

// Apply auth middleware universally to all template endpoints
templateBuilderRouter.use(authenticate);

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
