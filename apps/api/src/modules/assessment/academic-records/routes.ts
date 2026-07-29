import { Router } from 'express';
import { AcademicRecordsController } from './controllers/AcademicRecordsController';
import { GraduationController } from './controllers/GraduationController';
import { TranscriptRequestController } from './controllers/TranscriptRequestController';
import { checkPermission } from '../../../rbac/rbac.middleware';

export const academicRecordsRouter = Router();

// ==========================================
// STUDENT PROFILE ACADEMIC HISTORIES
// ==========================================
academicRecordsRouter.post(
    '/records',
    checkPermission('academic.records.manage' as any),
    AcademicRecordsController.saveRecord
);

// ==========================================
// GRADUATION COMPLIANCE WORKFLOWS
// ==========================================
academicRecordsRouter.post(
    '/graduation/candidate',
    checkPermission('academic.records.manage' as any),
    GraduationController.transitionGraduation
);

academicRecordsRouter.post(
    '/graduation/clearance',
    checkPermission('academic.records.manage' as any),
    GraduationController.approveClearance
);

// ==========================================
// TRANSCRIPT GENERATION
// ==========================================
academicRecordsRouter.post(
    '/transcripts/request',
    checkPermission('academic.records.manage' as any),
    TranscriptRequestController.createRequest
);

academicRecordsRouter.post(
    '/transcripts/generate',
    checkPermission('academic.records.manage' as any),
    TranscriptRequestController.generateTranscript
);

export default academicRecordsRouter;
