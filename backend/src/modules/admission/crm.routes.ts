import { Router } from 'express';
import { checkPermission } from '../../rbac/rbac.middleware';
import { PERMISSIONS } from '../../rbac/permissions';
import { checkIdempotency } from '../../middleware/idempotency.middleware';
import { 
    enquiryController, 
    leadController, 
    followupController, 
    visitorController 
} from './index';

export const crmRouter = Router();

// ==========================================
// ONLINE ENQUIRIES
// ==========================================
crmRouter.post('/enquiries',
    checkPermission(PERMISSIONS.ADMISSION_ENQUIRY_CREATE),
    enquiryController.create
);

crmRouter.get('/enquiries',
    checkPermission(PERMISSIONS.ADMISSION_ENQUIRY_VIEW),
    enquiryController.list
);

crmRouter.get('/enquiries/:id',
    checkPermission(PERMISSIONS.ADMISSION_ENQUIRY_VIEW),
    enquiryController.getById
);

crmRouter.put('/enquiries/:id',
    checkPermission(PERMISSIONS.ADMISSION_ENQUIRY_CREATE),
    enquiryController.update
);

crmRouter.delete('/enquiries/:id',
    checkPermission(PERMISSIONS.ADMISSION_ENQUIRY_CREATE),
    enquiryController.softDelete
);

crmRouter.post('/enquiries/:id/convert',
    checkPermission(PERMISSIONS.ADMISSION_LEADS_MANAGE),
    checkIdempotency,
    enquiryController.convert
);

// ==========================================
// LEAD MANAGEMENT
// ==========================================
crmRouter.get('/leads',
    checkPermission(PERMISSIONS.ADMISSION_LEADS_MANAGE),
    leadController.list
);

crmRouter.get('/leads/:id',
    checkPermission(PERMISSIONS.ADMISSION_LEADS_MANAGE),
    leadController.getById
);

crmRouter.put('/leads/:id',
    checkPermission(PERMISSIONS.ADMISSION_LEADS_MANAGE),
    leadController.update
);

crmRouter.put('/leads/:id/assign',
    checkPermission(PERMISSIONS.ADMISSION_LEADS_MANAGE),
    checkIdempotency,
    leadController.assign
);

// ==========================================
// FOLLOW-UP MANAGEMENT
// ==========================================
crmRouter.post('/followups',
    checkPermission(PERMISSIONS.ADMISSION_LEADS_MANAGE),
    checkIdempotency,
    followupController.create
);

crmRouter.get('/followups',
    checkPermission(PERMISSIONS.ADMISSION_LEADS_MANAGE),
    followupController.list
);

crmRouter.put('/followups/:id',
    checkPermission(PERMISSIONS.ADMISSION_LEADS_MANAGE),
    followupController.update
);

// ==========================================
// VISITOR REGISTER
// ==========================================
crmRouter.post('/visitors',
    checkPermission(PERMISSIONS.ADMISSION_VISITORS_MANAGE),
    visitorController.create
);

crmRouter.get('/visitors',
    checkPermission(PERMISSIONS.ADMISSION_VISITORS_MANAGE),
    visitorController.list
);

crmRouter.put('/visitors/:id',
    checkPermission(PERMISSIONS.ADMISSION_VISITORS_MANAGE),
    visitorController.update
);
