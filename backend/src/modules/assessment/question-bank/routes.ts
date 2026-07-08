import { Router } from 'express';
import { QuestionController } from './controllers/question.controller';
import { checkPermission } from '../../../rbac/rbac.middleware';
import { PERMISSIONS } from '../../../rbac/permissions';
import multer from 'multer';

const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit
export const questionBankRouter = Router();

// ==========================================
// FOLDERS ROUTING
// ==========================================
questionBankRouter.get('/folders',
    checkPermission(PERMISSIONS.ASSESSMENT_QUESTION_VIEW as any),
    QuestionController.listFolders
);

questionBankRouter.post('/folders',
    checkPermission(PERMISSIONS.ASSESSMENT_QUESTION_MANAGE as any),
    QuestionController.createFolder
);

questionBankRouter.put('/folders/:id',
    checkPermission(PERMISSIONS.ASSESSMENT_QUESTION_MANAGE as any),
    QuestionController.updateFolder
);

questionBankRouter.delete('/folders/:id',
    checkPermission(PERMISSIONS.ASSESSMENT_QUESTION_MANAGE as any),
    QuestionController.deleteFolder
);

// ==========================================
// QUESTIONS ROUTING
// ==========================================
questionBankRouter.get('/',
    checkPermission(PERMISSIONS.ASSESSMENT_QUESTION_VIEW as any),
    QuestionController.listQuestions
);

questionBankRouter.get('/:id',
    checkPermission(PERMISSIONS.ASSESSMENT_QUESTION_VIEW as any),
    QuestionController.getQuestionById
);

questionBankRouter.post('/',
    checkPermission(PERMISSIONS.ASSESSMENT_QUESTION_MANAGE as any),
    QuestionController.createQuestion
);

questionBankRouter.put('/:id',
    checkPermission(PERMISSIONS.ASSESSMENT_QUESTION_MANAGE as any),
    QuestionController.updateQuestion
);

questionBankRouter.delete('/:id',
    checkPermission(PERMISSIONS.ASSESSMENT_QUESTION_MANAGE as any),
    QuestionController.deleteQuestion
);

// ==========================================
// BATCH BULK INGESTION
// ==========================================
questionBankRouter.post('/import',
    upload.single('file'),
    checkPermission(PERMISSIONS.ASSESSMENT_QUESTION_IMPORT as any),
    QuestionController.importQuestions
);

export default questionBankRouter;
