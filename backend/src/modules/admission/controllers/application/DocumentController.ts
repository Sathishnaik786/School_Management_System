import { Request, Response } from 'express';
import { DocumentService } from '../../services/application/DocumentService';
import { DocumentUploadService } from '../../services/application/DocumentUploadService';
import { DocumentDownloadService } from '../../services/application/DocumentDownloadService';
import { DocumentVerificationService } from '../../services/application/DocumentVerificationService';
import { DocumentChecklistService } from '../../services/application/DocumentChecklistService';
import { FeatureFlagService } from '../../services/FeatureFlagService';
import { PermissionError } from '../../errors/PermissionError';
import { handleControllerError } from '../crm/ControllerErrorHandler';

export class DocumentController {
    constructor(
        private readonly docService: DocumentService,
        private readonly uploadService: DocumentUploadService,
        private readonly downloadService: DocumentDownloadService,
        private readonly verificationService: DocumentVerificationService,
        private readonly checklistService: DocumentChecklistService,
        private readonly flagService: FeatureFlagService
    ) {}

    private async checkFlags(req: Request) {
        const schoolId = req.context?.user?.school_id || null;
        const envMode = process.env.NODE_ENV || 'development';
        const isCrmActive = await this.flagService.isEnabled('admission', 'admission_crm', envMode, schoolId);
        const isDocActive = await this.flagService.isEnabled('admission', 'application_documents', envMode, schoolId);
        if (!isCrmActive || !isDocActive) {
            throw new PermissionError('Feature Disabled: application_documents');
        }
    }

    public upload = async (req: Request, res: Response) => {
        try {
            await this.checkFlags(req);
            
            // Check flag for upload
            const schoolId = req.context?.user?.school_id || null;
            const envMode = process.env.NODE_ENV || 'development';
            if (!await this.flagService.isEnabled('admission', 'document_upload', envMode, schoolId)) {
                throw new PermissionError('Feature Disabled: document_upload');
            }

            const { application_id, document_type_code } = req.body;
            const file = req.file;

            if (!file) {
                return res.status(400).json({ error: 'No file attachment found' });
            }

            const uploadedBy = req.context?.user?.id || null;
            const correlationId = req.headers['x-correlation-id'] as string;
            
            const metadata = {
                device: req.headers['user-agent'] || 'Unknown',
                browser: req.headers['user-agent'] || 'Unknown',
                ipAddress: req.ip || '127.0.0.1',
                uploadedFrom: 'API'
            };

            const data = await this.uploadService.uploadDocument(
                application_id,
                document_type_code,
                file.buffer,
                file.originalname,
                file.mimetype,
                uploadedBy,
                metadata,
                correlationId
            );

            res.status(201).json(data);
        } catch (err) {
            handleControllerError(res, err);
        }
    };

    public getById = async (req: Request, res: Response) => {
        try {
            await this.checkFlags(req);
            const { id } = req.params;
            const data = await this.docService.getDocumentById(id);
            res.json(data);
        } catch (err) {
            handleControllerError(res, err);
        }
    };

    public delete = async (req: Request, res: Response) => {
        try {
            await this.checkFlags(req);
            const { id } = req.params;
            await this.docService.deleteDocument(id);
            res.json({ success: true, message: 'Document deleted successfully' });
        } catch (err) {
            handleControllerError(res, err);
        }
    };

    public verify = async (req: Request, res: Response) => {
        try {
            await this.checkFlags(req);
            
            const schoolId = req.context?.user?.school_id || null;
            const envMode = process.env.NODE_ENV || 'development';
            if (!await this.flagService.isEnabled('admission', 'document_verification', envMode, schoolId)) {
                throw new PermissionError('Feature Disabled: document_verification');
            }

            const { id } = req.params;
            const { remarks } = req.body;
            const reviewerId = req.context?.user?.id || null;
            const role = req.context?.user?.roles?.[0] || 'counselor';
            const correlationId = req.headers['x-correlation-id'] as string;

            const data = await this.verificationService.verify(id, reviewerId, remarks, role, correlationId);
            res.json({ success: true, document: data, message: 'Document marked verified successfully' });
        } catch (err) {
            handleControllerError(res, err);
        }
    };

    public reject = async (req: Request, res: Response) => {
        try {
            await this.checkFlags(req);
            
            const schoolId = req.context?.user?.school_id || null;
            const envMode = process.env.NODE_ENV || 'development';
            if (!await this.flagService.isEnabled('admission', 'document_verification', envMode, schoolId)) {
                throw new PermissionError('Feature Disabled: document_verification');
            }

            const { id } = req.params;
            const { remarks } = req.body;
            const reviewerId = req.context?.user?.id || null;
            const role = req.context?.user?.roles?.[0] || 'counselor';
            const correlationId = req.headers['x-correlation-id'] as string;

            const data = await this.verificationService.reject(id, reviewerId, remarks, role, correlationId);
            res.json({ success: true, document: data, message: 'Document rejected successfully' });
        } catch (err) {
            handleControllerError(res, err);
        }
    };

    public requestCorrection = async (req: Request, res: Response) => {
        try {
            await this.checkFlags(req);
            
            const schoolId = req.context?.user?.school_id || null;
            const envMode = process.env.NODE_ENV || 'development';
            if (!await this.flagService.isEnabled('admission', 'document_verification', envMode, schoolId)) {
                throw new PermissionError('Feature Disabled: document_verification');
            }

            const { id } = req.params;
            const { remarks } = req.body;
            const reviewerId = req.context?.user?.id || null;
            const role = req.context?.user?.roles?.[0] || 'counselor';
            const correlationId = req.headers['x-correlation-id'] as string;

            const data = await this.verificationService.requestCorrection(id, reviewerId, remarks, role, correlationId);
            res.json({ success: true, document: data, message: 'Correction requested successfully' });
        } catch (err) {
            handleControllerError(res, err);
        }
    };

    public getSignedUrl = async (req: Request, res: Response) => {
        try {
            await this.checkFlags(req);
            
            const schoolId = req.context?.user?.school_id || null;
            const envMode = process.env.NODE_ENV || 'development';
            if (!await this.flagService.isEnabled('admission', 'document_download', envMode, schoolId)) {
                throw new PermissionError('Feature Disabled: document_download');
            }

            const { id } = req.params;
            const requestedBy = req.context?.user?.id || null;
            const correlationId = req.headers['x-correlation-id'] as string;

            const signedUrl = await this.downloadService.getSignedDownloadUrl(id, requestedBy, 3600, correlationId);
            res.json({ success: true, download_url: signedUrl });
        } catch (err) {
            handleControllerError(res, err);
        }
    };

    public getChecklist = async (req: Request, res: Response) => {
        try {
            await this.checkFlags(req);
            
            const schoolId = req.context?.user?.school_id || null;
            const envMode = process.env.NODE_ENV || 'development';
            if (!await this.flagService.isEnabled('admission', 'document_checklist', envMode, schoolId)) {
                throw new PermissionError('Feature Disabled: document_checklist');
            }

            const { grade } = req.params;
            const academicYearId = req.headers['x-academic-year-id'] as string;
            if (!schoolId || !academicYearId) {
                throw new Error('School and Academic Year contexts are required');
            }

            const data = await this.checklistService.getChecklist(schoolId, academicYearId, grade);
            res.json(data);
        } catch (err) {
            handleControllerError(res, err);
        }
    };

    public listByApplication = async (req: Request, res: Response) => {
        try {
            await this.checkFlags(req);
            const { applicationId } = req.params;
            const data = await this.docService.getDocumentsByApplicationId(applicationId);
            res.json(data);
        } catch (err) {
            handleControllerError(res, err);
        }
    };
}
