import { Router } from 'express';
import { checkPermission } from '../../rbac/rbac.middleware';
import { checkIdempotency } from '../../middleware/idempotency.middleware';
import { enrollmentController } from './index';

export const enrollmentRouter = Router();

// 1. Fee structure setup & waivers
enrollmentRouter.post('/fees/assign',
    checkPermission('admission.fees.manage'),
    checkIdempotency,
    enrollmentController.assignFeeStructure
);

enrollmentRouter.get('/fees/:applicationId',
    checkPermission('admission.fees.manage'),
    enrollmentController.getFeesSummary
);

enrollmentRouter.post('/waivers',
    checkPermission('admission.payments.record'),
    checkIdempotency,
    enrollmentController.applyFeeWaiver
);

// 2. Payments collection & verification
enrollmentRouter.post('/payments',
    checkPermission('admission.payments.record'),
    checkIdempotency,
    enrollmentController.collectPayment
);

enrollmentRouter.post('/payments/verify',
    checkPermission('admission.payments.record'),
    checkIdempotency,
    enrollmentController.verifyPayment
);

enrollmentRouter.get('/payments/:paymentId/receipt',
    checkPermission('admission.payments.record'),
    enrollmentController.getReceipt
);

// 3. Confirmations & handover enrollments
enrollmentRouter.post('/confirm',
    checkPermission('admission.confirm.enroll'),
    checkIdempotency,
    enrollmentController.confirmAdmission
);

enrollmentRouter.post('/enroll',
    checkPermission('admission.confirm.enroll'),
    checkIdempotency,
    enrollmentController.enrollStudent
);

enrollmentRouter.get('/status/:applicationId',
    checkPermission('admission.confirm.enroll'),
    enrollmentController.getEnrollmentStatus
);
