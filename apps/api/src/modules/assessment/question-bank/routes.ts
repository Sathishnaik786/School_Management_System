import { Router } from 'express';
import { QuestionController } from './controllers/question.controller';
import { FolderController } from './controllers/FolderController';
import { WorkflowController } from './controllers/WorkflowController';
import { AssetController } from './controllers/AssetController';
import { SearchController } from './controllers/SearchController';
import { ImportController } from './controllers/ImportController';
import { VersionController } from './controllers/VersionController';
import { checkPermission } from '../../../rbac/rbac.middleware';
import { PERMISSIONS } from '../../../rbac/permissions';

export const questionBankRouter = Router();

// ==========================================
// SEARCH ENDPOINT
// ==========================================
questionBankRouter.get('/search',
    checkPermission(PERMISSIONS.ASSESSMENT_QUESTION_VIEW as any),
    SearchController.searchQuestions
);

// ==========================================
// FOLDERS ROUTING
// ==========================================
questionBankRouter.get('/folders',
    checkPermission(PERMISSIONS.ASSESSMENT_QUESTION_VIEW as any),
    FolderController.listFolders
);

questionBankRouter.get('/folders/stats',
    checkPermission(PERMISSIONS.ASSESSMENT_QUESTION_VIEW as any),
    FolderController.getFolderStatistics
);

questionBankRouter.post('/folders',
    checkPermission(PERMISSIONS.ASSESSMENT_FOLDER_MANAGE as any),
    FolderController.createFolder
);

questionBankRouter.put('/folders/:id',
    checkPermission(PERMISSIONS.ASSESSMENT_FOLDER_MANAGE as any),
    FolderController.updateFolder
);

questionBankRouter.delete('/folders/:id',
    checkPermission(PERMISSIONS.ASSESSMENT_FOLDER_MANAGE as any),
    FolderController.deleteFolder
);

questionBankRouter.post('/folders/move',
    checkPermission(PERMISSIONS.ASSESSMENT_FOLDER_MANAGE as any),
    FolderController.bulkMoveQuestions
);

questionBankRouter.post('/folders/copy',
    checkPermission(PERMISSIONS.ASSESSMENT_FOLDER_MANAGE as any),
    FolderController.bulkCopyQuestions
);

// ==========================================
// BATCH BULK INGESTION
// ==========================================
questionBankRouter.post('/import',
    checkPermission(PERMISSIONS.ASSESSMENT_QUESTION_IMPORT as any),
    ImportController.importCsv
);

// ==========================================
// QUESTION ASSETS ROUTING
// ==========================================
questionBankRouter.post('/assets',
    checkPermission(PERMISSIONS.ASSESSMENT_ASSET_UPLOAD as any),
    AssetController.uploadAsset
);

questionBankRouter.post('/assets/link',
    checkPermission(PERMISSIONS.ASSESSMENT_ASSET_UPLOAD as any),
    AssetController.linkAsset
);

questionBankRouter.post('/assets/unlink',
    checkPermission(PERMISSIONS.ASSESSMENT_ASSET_UPLOAD as any),
    AssetController.unlinkAsset
);

questionBankRouter.get('/:id/assets',
    checkPermission(PERMISSIONS.ASSESSMENT_QUESTION_VIEW as any),
    AssetController.getQuestionAssets
);

questionBankRouter.delete('/assets/:id',
    checkPermission(PERMISSIONS.ASSESSMENT_ASSET_DELETE as any),
    AssetController.deleteAsset
);

// ==========================================
// QUESTION VERSIONS ROUTING
// ==========================================
questionBankRouter.get('/:id/versions',
    checkPermission(PERMISSIONS.ASSESSMENT_QUESTION_VIEW as any),
    VersionController.getVersionsHistory
);

questionBankRouter.post('/:id/versions/restore',
    checkPermission(PERMISSIONS.ASSESSMENT_QUESTION_UPDATE as any),
    VersionController.restoreVersion
);

// ==========================================
// WORKFLOW LIFECYCLE TRANSITION
// ==========================================
questionBankRouter.post('/:id/workflow/transition',
    checkPermission(PERMISSIONS.ASSESSMENT_QUESTION_REVIEW as any),
    WorkflowController.transitionQuestion
);

// ==========================================
// QUESTIONS GENERAL CRUD
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
    checkPermission(PERMISSIONS.ASSESSMENT_QUESTION_CREATE as any),
    QuestionController.createQuestion
);

questionBankRouter.put('/:id',
    checkPermission(PERMISSIONS.ASSESSMENT_QUESTION_UPDATE as any),
    QuestionController.updateQuestion
);

questionBankRouter.delete('/:id',
    checkPermission(PERMISSIONS.ASSESSMENT_QUESTION_DELETE as any),
    QuestionController.deleteQuestion
);

export default questionBankRouter;
