import { Router } from 'express';
import { AnalyticsController } from './controllers/AnalyticsController';
import { COController } from './controllers/COController';
import { POController } from './controllers/POController';
import { QuestionStatisticsController } from './controllers/QuestionStatisticsController';
import { AccreditationController } from './controllers/AccreditationController';
import { PredictionController } from './controllers/PredictionController';
import { checkPermission } from '../../../rbac/rbac.middleware';

export const analyticsRouter = Router();

// ==========================================
// SNAPSHOTS & CACHE WAREHOUSE
// ==========================================
analyticsRouter.post(
    '/snapshots',
    checkPermission('assessment.analytics.manage' as any),
    AnalyticsController.saveSnapshot
);

analyticsRouter.get(
    '/snapshots',
    checkPermission('assessment.analytics.view' as any),
    AnalyticsController.listSnapshots
);

// ==========================================
// OBE ATTAINMENT METRICS
// ==========================================
analyticsRouter.post(
    '/co/attainment',
    checkPermission('assessment.analytics.manage' as any),
    COController.calculateAttainment
);

analyticsRouter.post(
    '/po/attainment',
    checkPermission('assessment.analytics.manage' as any),
    POController.calculateAttainment
);

// ==========================================
// ITEM STATISTICS
// ==========================================
analyticsRouter.post(
    '/question/stats',
    checkPermission('assessment.analytics.manage' as any),
    QuestionStatisticsController.calculateQuestionStats
);

// ==========================================
// ACCREDITATION & BENCHMARKS
// ==========================================
analyticsRouter.post(
    '/accreditation/compile',
    checkPermission('assessment.analytics.accreditation' as any),
    AccreditationController.compileReport
);

// ==========================================
// PREDICTIVE RISK SCORES
// ==========================================
analyticsRouter.post(
    '/prediction/risk',
    checkPermission('assessment.analytics.prediction' as any),
    PredictionController.processRiskScore
);

export default analyticsRouter;
