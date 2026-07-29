import { Request, Response } from 'express';
import { TemplateService } from '../services/template.service';
import { TemplateValidationService } from '../services/TemplateValidationService';

export class TemplateController {
    private static templateService = new TemplateService();
    private static validationService = new TemplateValidationService();

    public static async listTemplates(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            if (!schoolId) return res.status(400).json({ error: 'School context could not be resolved.' });

            const { subjectId, blueprintId, page, limit } = req.query;
            const result = await TemplateController.templateService.listTemplates(schoolId, {
                subjectId: subjectId ? String(subjectId) : undefined,
                blueprintId: blueprintId ? String(blueprintId) : undefined,
                page: page ? parseInt(String(page), 10) : 1,
                limit: limit ? parseInt(String(limit), 10) : 10
            });

            return res.status(200).json(result);
        } catch (error: any) {
            return res.status(error.status || 500).json({ error: error.message || 'Failed to list templates' });
        }
    }

    public static async getTemplateById(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const schoolId = (req as any).context?.user?.school_id;
            if (!schoolId) return res.status(400).json({ error: 'School context could not be resolved.' });

            const template = await TemplateController.templateService.getTemplateById(id, schoolId);
            return res.status(200).json(template);
        } catch (error: any) {
            return res.status(error.status || 500).json({ error: error.message || 'Failed to fetch template' });
        }
    }

    public static async createTemplate(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            if (!schoolId || !userId) return res.status(400).json({ error: 'Context credentials could not be resolved.' });

            const template = await TemplateController.templateService.createTemplate(schoolId, userId, req.body);
            return res.status(201).json(template);
        } catch (error: any) {
            return res.status(error.status || 400).json({ error: error.message || 'Failed to create template' });
        }
    }

    public static async updateTemplate(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            if (!schoolId || !userId) return res.status(400).json({ error: 'Context credentials could not be resolved.' });

            const template = await TemplateController.templateService.updateTemplate(id, schoolId, userId, req.body);
            return res.status(200).json(template);
        } catch (error: any) {
            return res.status(error.status || 400).json({ error: error.message || 'Failed to update template' });
        }
    }

    public static async deleteTemplate(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            if (!schoolId || !userId) return res.status(400).json({ error: 'Context credentials could not be resolved.' });

            await TemplateController.templateService.deleteTemplate(id, schoolId, userId);
            return res.status(200).json({ message: 'Template successfully deleted.' });
        } catch (error: any) {
            return res.status(error.status || 400).json({ error: error.message || 'Failed to delete template' });
        }
    }

    public static async updateTemplateSections(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            if (!schoolId || !userId) return res.status(400).json({ error: 'Context credentials could not be resolved.' });

            const updated = await TemplateController.templateService.updateTemplate(id, schoolId, userId, req.body);
            return res.status(200).json(updated);
        } catch (error: any) {
            return res.status(error.status || 400).json({ error: error.message || 'Failed to update template sections' });
        }
    }

    public static async publishTemplate(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            if (!schoolId || !userId) return res.status(400).json({ error: 'Context credentials could not be resolved.' });

            // Run validation check before publish
            const report = await TemplateController.validationService.validateTemplate(id, schoolId);
            if (!report.success) {
                return res.status(400).json({ error: 'Template validation failed.', details: report.errors });
            }

            const result = await TemplateController.templateService.updateTemplate(id, schoolId, userId, { status: 'PUBLISHED' });
            return res.status(200).json(result);
        } catch (error: any) {
            return res.status(error.status || 400).json({ error: error.message || 'Failed to publish template' });
        }
    }

    public static async cloneTemplate(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            if (!schoolId || !userId) return res.status(400).json({ error: 'Context credentials could not be resolved.' });

            const cloned = await TemplateController.templateService.cloneTemplate(id, schoolId, userId);
            return res.status(201).json(cloned);
        } catch (error: any) {
            return res.status(error.status || 400).json({ error: error.message || 'Failed to clone template' });
        }
    }

    public static async validateTemplateRules(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const schoolId = (req as any).context?.user?.school_id;
            if (!schoolId) return res.status(400).json({ error: 'School context could not be resolved.' });

            const report = await TemplateController.validationService.validateTemplate(id, schoolId);
            return res.status(200).json(report);
        } catch (error: any) {
            return res.status(500).json({ error: error.message || 'Failed to validate template rules.' });
        }
    }
}
export default TemplateController;
