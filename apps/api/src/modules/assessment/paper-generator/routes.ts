import { Router } from 'express';
import { PaperController } from './controllers/PaperController';
import { PaperWorkflowController } from './controllers/PaperWorkflowController';
import { PaperValidationController } from './controllers/PaperValidationController';
import { PaperVersionController } from './controllers/PaperVersionController';
import { PaperStatisticsController } from './controllers/PaperStatisticsController';
import { PaperExportController } from './controllers/PaperExportController';
import { GenerationJobController } from './controllers/GenerationJobController';
import { checkPermission } from '../../../rbac/rbac.middleware';

export const paperGeneratorRouter = Router();

// ==========================================
// ANALYTICS & JOBS QUEUE
// ==========================================
paperGeneratorRouter.get(
    '/analytics',
    checkPermission('assessment.paper.analytics' as any),
    PaperStatisticsController.getMetrics
);

paperGeneratorRouter.get(
    '/jobs',
    checkPermission('assessment.paper.generate' as any),
    GenerationJobController.listJobs
);

paperGeneratorRouter.post(
    '/jobs',
    checkPermission('assessment.paper.generate' as any),
    GenerationJobController.createJob
);

// ==========================================
// VALIDATION & WORKFLOW
// ==========================================
paperGeneratorRouter.post(
    '/:id/validate',
    checkPermission('assessment.paper.validate' as any),
    PaperValidationController.validatePaper
);

paperGeneratorRouter.post(
    '/:id/workflow/transition',
    checkPermission('assessment.paper.publish' as any),
    PaperWorkflowController.transitionStatus
);

// ==========================================
// EXPORTS & VERSIONS
// ==========================================
paperGeneratorRouter.post(
    '/:id/export',
    checkPermission('assessment.paper.export' as any),
    PaperExportController.exportPaper
);

paperGeneratorRouter.get(
    '/:id/versions',
    checkPermission('assessment.paper.preview' as any),
    PaperVersionController.getHistory
);

// ==========================================
// CRUD OPERATIONS
// ==========================================
paperGeneratorRouter.get(
    '/',
    checkPermission('assessment.paper.preview' as any),
    PaperController.listPapers
);

paperGeneratorRouter.post(
    '/',
    checkPermission('assessment.paper.generate' as any),
    PaperController.createPaper
);

paperGeneratorRouter.get(
    '/:id',
    checkPermission('assessment.paper.preview' as any),
    PaperController.getPaperById
);

paperGeneratorRouter.delete(
    '/:id',
    checkPermission('assessment.paper.generate' as any),
    PaperController.deletePaper
);

export default paperGeneratorRouter;
