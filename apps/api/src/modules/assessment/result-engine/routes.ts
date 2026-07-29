import { Router } from 'express';
import { ResultController } from './controllers/ResultController';
import { PublicationController } from './controllers/PublicationController';
import { RankingController } from './controllers/RankingController';
import { PromotionController } from './controllers/PromotionController';
import { WorkflowController } from './controllers/WorkflowController';
import { checkPermission } from '../../../rbac/rbac.middleware';

export const resultEngineRouter = Router();

// ==========================================
// RESULT SESSIONS CALCULATIONS
// ==========================================
resultEngineRouter.get(
    '/sessions',
    checkPermission('assessment.result.view' as any),
    ResultController.listSessions
);

resultEngineRouter.post(
    '/sessions',
    checkPermission('assessment.result.calculate' as any),
    ResultController.createSession
);

resultEngineRouter.post(
    '/calculate',
    checkPermission('assessment.result.calculate' as any),
    ResultController.calculateResults
);

// ==========================================
// WORKFLOW APPROVALS & SNAPSHOTS
// ==========================================
resultEngineRouter.post(
    '/session/:id/workflow/transition',
    checkPermission('assessment.result.verify' as any),
    WorkflowController.transitionStatus
);

resultEngineRouter.post(
    '/session/:id/publish',
    checkPermission('assessment.result.publish' as any),
    PublicationController.publishResults
);

// ==========================================
// COHORT MERIT RANKINGS
// ==========================================
resultEngineRouter.post(
    '/rankings/calculate',
    checkPermission('assessment.result.statistics' as any),
    RankingController.calculateRankings
);

// ==========================================
// STUDENT PROMOTIONS ENGINE
// ==========================================
resultEngineRouter.post(
    '/promotions/process',
    checkPermission('assessment.result.promotion' as any),
    PromotionController.processPromotion
);

export default resultEngineRouter;
