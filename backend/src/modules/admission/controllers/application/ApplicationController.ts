import { Request, Response } from 'express';
import { ApplicationService } from '../../services/application/ApplicationService';
import { DraftService } from '../../services/application/DraftService';
import { ApplicationWorkflowService } from '../../services/application/ApplicationWorkflowService';
import { FeatureFlagService } from '../../services/FeatureFlagService';
import { PermissionError } from '../../errors/PermissionError';
import { handleControllerError } from '../crm/ControllerErrorHandler';

export class ApplicationController {
    constructor(
        private readonly appService: ApplicationService,
        private readonly draftService: DraftService,
        private readonly workflowService: ApplicationWorkflowService,
        private readonly flagService: FeatureFlagService
    ) {}

    private async checkFlags(req: Request) {
        const schoolId = req.context?.user?.school_id || null;
        const envMode = process.env.NODE_ENV || 'development';
        const isCrmActive = await this.flagService.isEnabled('admission', 'admission_crm', envMode, schoolId);
        const isAppActive = await this.flagService.isEnabled('admission', 'application_management', envMode, schoolId);
        if (!isCrmActive || !isAppActive) {
            throw new PermissionError('Feature Disabled: application_management');
        }
    }

    public create = async (req: Request, res: Response) => {
        try {
            await this.checkFlags(req);
            const schoolId = req.context?.user?.school_id;
            const academicYearId = req.headers['x-academic-year-id'] as string || req.body.academic_year_id;
            const createdBy = req.context?.user?.id || null;
            if (!schoolId || !academicYearId) {
                throw new Error('School context and Academic Year context are required');
            }

            const correlationId = req.headers['x-correlation-id'] as string;
            const data = await this.appService.createApplication(
                schoolId,
                academicYearId,
                createdBy,
                req.body,
                correlationId
            );
            res.status(201).json(data);
        } catch (err) {
            handleControllerError(res, err);
        }
    };

    public resume = async (req: Request, res: Response) => {
        try {
            await this.checkFlags(req);
            const { id } = req.params;
            const data = await this.draftService.resumeDraft(id);
            res.json(data);
        } catch (err) {
            handleControllerError(res, err);
        }
    };

    public patchProfile = async (req: Request, res: Response) => {
        try {
            await this.checkFlags(req);
            const { id } = req.params;
            const expectedUpdatedAt = req.headers['x-expected-updated-at'] as string || req.body.expected_updated_at;
            if (!expectedUpdatedAt) {
                return res.status(400).json({ error: 'x-expected-updated-at header/expected_updated_at attribute is required' });
            }

            const correlationId = req.headers['x-correlation-id'] as string;
            await this.draftService.patchDraftSection(id, 'profile', req.body, expectedUpdatedAt, correlationId);
            res.json({ success: true, message: 'Student profile draft updated successfully' });
        } catch (err) {
            handleControllerError(res, err);
        }
    };

    public patchParents = async (req: Request, res: Response) => {
        try {
            await this.checkFlags(req);
            const { id } = req.params;
            const expectedUpdatedAt = req.headers['x-expected-updated-at'] as string || req.body.expected_updated_at;
            if (!expectedUpdatedAt) {
                return res.status(400).json({ error: 'x-expected-updated-at header/expected_updated_at attribute is required' });
            }

            const correlationId = req.headers['x-correlation-id'] as string;
            await this.draftService.patchDraftSection(id, 'parents', req.body, expectedUpdatedAt, correlationId);
            res.json({ success: true, message: 'Parents draft details updated successfully' });
        } catch (err) {
            handleControllerError(res, err);
        }
    };

    public patchEducation = async (req: Request, res: Response) => {
        try {
            await this.checkFlags(req);
            const { id } = req.params;
            const expectedUpdatedAt = req.headers['x-expected-updated-at'] as string || req.body.expected_updated_at;
            if (!expectedUpdatedAt) {
                return res.status(400).json({ error: 'x-expected-updated-at header/expected_updated_at attribute is required' });
            }

            const correlationId = req.headers['x-correlation-id'] as string;
            await this.draftService.patchDraftSection(id, 'education', req.body, expectedUpdatedAt, correlationId);
            res.json({ success: true, message: 'Previous education draft updated successfully' });
        } catch (err) {
            handleControllerError(res, err);
        }
    };

    public patchPreferences = async (req: Request, res: Response) => {
        try {
            await this.checkFlags(req);
            const { id } = req.params;
            const expectedUpdatedAt = req.headers['x-expected-updated-at'] as string || req.body.expected_updated_at;
            if (!expectedUpdatedAt) {
                return res.status(400).json({ error: 'x-expected-updated-at header/expected_updated_at attribute is required' });
            }

            const correlationId = req.headers['x-correlation-id'] as string;
            await this.draftService.patchDraftSection(id, 'preferences', req.body, expectedUpdatedAt, correlationId);
            res.json({ success: true, message: 'Preferences draft details updated successfully' });
        } catch (err) {
            handleControllerError(res, err);
        }
    };

    public patchDeclaration = async (req: Request, res: Response) => {
        try {
            await this.checkFlags(req);
            const { id } = req.params;
            const expectedUpdatedAt = req.headers['x-expected-updated-at'] as string || req.body.expected_updated_at;
            if (!expectedUpdatedAt) {
                return res.status(400).json({ error: 'x-expected-updated-at header/expected_updated_at attribute is required' });
            }

            const correlationId = req.headers['x-correlation-id'] as string;
            await this.draftService.patchDraftSection(id, 'declaration', req.body, expectedUpdatedAt, correlationId);
            res.json({ success: true, message: 'Declaration draft signed successfully' });
        } catch (err) {
            handleControllerError(res, err);
        }
    };

    public submit = async (req: Request, res: Response) => {
        try {
            await this.checkFlags(req);
            const { id } = req.params;
            const role = req.context?.user?.roles?.[0] || 'counselor';
            const performedBy = req.context?.user?.id || null;
            const correlationId = req.headers['x-correlation-id'] as string;

            const data = await this.appService.submitApplication(id, req.body, role, performedBy, correlationId);
            res.json({ success: true, application: data, message: 'Application submitted successfully' });
        } catch (err) {
            handleControllerError(res, err);
        }
    };

    public getTimeline = async (req: Request, res: Response) => {
        try {
            await this.checkFlags(req);
            const { id } = req.params;
            const data = await this.appService.getTimeline(id);
            res.json(data);
        } catch (err) {
            handleControllerError(res, err);
        }
    };

    public deleteDraft = async (req: Request, res: Response) => {
        try {
            await this.checkFlags(req);
            const { id } = req.params;
            const correlationId = req.headers['x-correlation-id'] as string;
            await this.draftService.deleteDraft(id, correlationId);
            res.json({ success: true, message: 'Application draft deleted successfully' });
        } catch (err) {
            handleControllerError(res, err);
        }
    };

    public transition = async (req: Request, res: Response) => {
        try {
            await this.checkFlags(req);
            const { id } = req.params;
            const { to_status, notes } = req.body;
            const role = req.context?.user?.roles?.[0] || 'counselor';
            const performedBy = req.context?.user?.id || null;
            const correlationId = req.headers['x-correlation-id'] as string;

            const data = await this.workflowService.transitionTo(
                id,
                to_status,
                role,
                performedBy,
                notes,
                correlationId
            );
            res.json({ success: true, application: data, message: 'Application transitioned successfully' });
        } catch (err) {
            handleControllerError(res, err);
        }
    };
}
