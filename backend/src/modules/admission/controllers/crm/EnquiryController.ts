import { Request, Response } from 'express';
import { EnquiryService } from '../../services/crm/EnquiryService';
import { FeatureFlagService } from '../../services/FeatureFlagService';
import { PermissionError } from '../../errors/PermissionError';
import { handleControllerError } from './ControllerErrorHandler';

export class EnquiryController {
    constructor(
        private readonly enquiryService: EnquiryService,
        private readonly flagService: FeatureFlagService
    ) {}

    private async checkFlags(req: Request) {
        const schoolId = req.context?.user?.school_id || null;
        const envMode = process.env.NODE_ENV || 'development';
        const isCrmActive = await this.flagService.isEnabled('admission', 'admission_crm', envMode, schoolId);
        const isEnqActive = await this.flagService.isEnabled('admission', 'enquiry_management', envMode, schoolId);
        if (!isCrmActive || !isEnqActive) {
            throw new PermissionError('Feature Disabled: enquiry_management');
        }
    }

    public create = async (req: Request, res: Response) => {
        try {
            await this.checkFlags(req);
            const schoolId = req.context?.user?.school_id;
            const academicYearId = req.headers['x-academic-year-id'] as string || req.body.academic_year_id;
            if (!schoolId) throw new Error('School context not found');
            if (!academicYearId) throw new Error('Academic Year context is required');

            const correlationId = req.headers['x-correlation-id'] as string;
            const data = await this.enquiryService.createEnquiry(schoolId, academicYearId, req.body, correlationId);
            res.status(201).json(data);
        } catch (err) {
            handleControllerError(res, err);
        }
    };

    public update = async (req: Request, res: Response) => {
        try {
            await this.checkFlags(req);
            const { id } = req.params;
            const correlationId = req.headers['x-correlation-id'] as string;
            const data = await this.enquiryService.updateEnquiry(id, req.body, correlationId);
            res.json(data);
        } catch (err) {
            handleControllerError(res, err);
        }
    };

    public getById = async (req: Request, res: Response) => {
        try {
            await this.checkFlags(req);
            const { id } = req.params;
            const data = await this.enquiryService.getEnquiryById(id);
            res.json(data);
        } catch (err) {
            handleControllerError(res, err);
        }
    };

    public list = async (req: Request, res: Response) => {
        try {
            await this.checkFlags(req);
            const schoolId = req.context?.user?.school_id;
            if (!schoolId) throw new Error('School context not found');

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string || undefined;
            const sortColumn = req.query.sort_column as string || undefined;
            const sortOrder = req.query.sort_order as 'asc' | 'desc' || undefined;

            const { page: _p, limit: _l, search: _s, sort_column: _sc, sort_order: _so, ...filters } = req.query;

            const data = await this.enquiryService.listEnquiries(
                schoolId,
                page,
                limit,
                filters,
                search,
                sortColumn,
                sortOrder
            );
            res.json(data);
        } catch (err) {
            handleControllerError(res, err);
        }
    };

    public softDelete = async (req: Request, res: Response) => {
        try {
            await this.checkFlags(req);
            const { id } = req.params;
            const correlationId = req.headers['x-correlation-id'] as string;
            await this.enquiryService.deleteEnquiry(id, correlationId);
            res.json({ success: true, message: 'Enquiry deleted successfully' });
        } catch (err) {
            handleControllerError(res, err);
        }
    };

    public convert = async (req: Request, res: Response) => {
        try {
            await this.checkFlags(req);
            const { id } = req.params;
            const correlationId = req.headers['x-correlation-id'] as string;
            const leadId = await this.enquiryService.convertToLead(id, correlationId);
            res.json({ success: true, lead_id: leadId, message: 'Enquiry converted to lead successfully' });
        } catch (err) {
            handleControllerError(res, err);
        }
    };
}
