import { Router } from 'express';
import { EvaluationController } from './controllers/EvaluationController';
import { RubricController } from './controllers/RubricController';
import { ModerationController } from './controllers/ModerationController';
import { RevaluationController } from './controllers/RevaluationController';
import { GradeCalculationController } from './controllers/GradeCalculationController';
import { EvaluationAnalyticsController } from './controllers/EvaluationAnalyticsController';
import { checkPermission } from '../../../rbac/rbac.middleware';

export const evaluationRouter = Router();

// ==========================================
// ANALYTICS & METRICS
// ==========================================
evaluationRouter.get(
    '/analytics',
    checkPermission('assessment.evaluation.analytics' as any),
    EvaluationAnalyticsController.getMetrics
);

// ==========================================
// RUBRICS LIBRARY
// ==========================================
evaluationRouter.get(
    '/rubrics',
    checkPermission('assessment.evaluation.view' as any),
    RubricController.listRubrics
);

evaluationRouter.post(
    '/rubrics',
    checkPermission('assessment.evaluation.score' as any),
    RubricController.createRubric
);

// ==========================================
// MODERATION QUEUE
// ==========================================
evaluationRouter.get(
    '/moderation',
    checkPermission('assessment.evaluation.moderate' as any),
    ModerationController.listQueue
);

evaluationRouter.post(
    '/moderation/:id/resolve',
    checkPermission('assessment.evaluation.moderate' as any),
    ModerationController.resolveModeration
);

// ==========================================
// REVALUATION FLOW
// ==========================================
evaluationRouter.get(
    '/revaluation',
    checkPermission('assessment.evaluation.view' as any),
    RevaluationController.listRequests
);

evaluationRouter.post(
    '/revaluation',
    checkPermission('assessment.evaluation.revaluate' as any),
    RevaluationController.apply
);

evaluationRouter.post(
    '/revaluation/:id/approve',
    checkPermission('assessment.evaluation.revaluate' as any),
    RevaluationController.approve
);

// ==========================================
// GRADE CALCULATIONS
// ==========================================
evaluationRouter.post(
    '/grades/calculate',
    checkPermission('assessment.evaluation.finalize' as any),
    GradeCalculationController.calculateGrade
);

evaluationRouter.get(
    '/grades/attempt/:attemptId',
    checkPermission('assessment.evaluation.view' as any),
    GradeCalculationController.getCalculationByAttempt
);

// ==========================================
// EVALUATION SESSIONS WORKSPACE
// ==========================================
evaluationRouter.get(
    '/sessions',
    checkPermission('assessment.evaluation.view' as any),
    EvaluationController.listSessions
);

evaluationRouter.post(
    '/start',
    checkPermission('assessment.evaluation.start' as any),
    EvaluationController.startSession
);

evaluationRouter.get(
    '/session/:id',
    checkPermission('assessment.evaluation.view' as any),
    EvaluationController.getSessionById
);

evaluationRouter.post(
    '/session/:id/evaluate',
    checkPermission('assessment.evaluation.score' as any),
    EvaluationController.evaluateQuestion
);

evaluationRouter.post(
    '/session/:id/workflow/transition',
    checkPermission('assessment.evaluation.finalize' as any),
    EvaluationController.transitionWorkflow
);

export default evaluationRouter;
