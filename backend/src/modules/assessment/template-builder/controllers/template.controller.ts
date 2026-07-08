import { Request, Response } from 'express';
import { TemplateService } from '../services/template.service';

export class TemplateController {
    private static templateService = new TemplateService();

    public static async listTemplates(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            if (!schoolId) {
                return res.status(400).json({ error: 'School context could not be resolved.' });
            }

            const { subjectId, page, limit } = req.query;

            const result = await TemplateController.templateService.listTemplates(schoolId, {
                subjectId: subjectId ? String(subjectId) : undefined,
                page: page ? parseInt(String(page), 10) : 1,
                limit: limit ? parseInt(String(limit), 10) : 10
            });

            return res.status(200).json(result);
        } catch (error: any) {
            console.error('[LIST TEMPLATES ERROR]', error);
            return res.status(error.status || 500).json({ error: error.message || 'Failed to list templates' });
        }
    }

    public static async getTemplateById(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const { id } = req.params;
            if (!schoolId) {
                return res.status(400).json({ error: 'School context could not be resolved.' });
            }

            const template = await TemplateController.templateService.getTemplateById(id, schoolId);
            return res.status(200).json(template);
        } catch (error: any) {
            console.error('[GET TEMPLATE ERROR]', error);
            return res.status(error.status || 500).json({ error: error.message || 'Failed to fetch template' });
        }
    }

    public static async createTemplate(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            if (!schoolId || !userId) {
                return res.status(400).json({ error: 'School or user context could not be resolved.' });
            }

            const template = await TemplateController.templateService.createTemplate(schoolId, userId, req.body);
            return res.status(201).json(template);
        } catch (error: any) {
            console.error('[CREATE TEMPLATE ERROR]', error);
            return res.status(error.status || 400).json({ error: error.message || 'Failed to create template' });
        }
    }

    public static async updateTemplate(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            const { id } = req.params;
            if (!schoolId || !userId) {
                return res.status(400).json({ error: 'School or user context could not be resolved.' });
            }

            const template = await TemplateController.templateService.updateTemplate(id, schoolId, userId, req.body);
            return res.status(200).json(template);
        } catch (error: any) {
            console.error('[UPDATE TEMPLATE ERROR]', error);
            return res.status(error.status || 400).json({ error: error.message || 'Failed to update template' });
        }
    }

    public static async deleteTemplate(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            const { id } = req.params;
            if (!schoolId || !userId) {
                return res.status(400).json({ error: 'School or user context could not be resolved.' });
            }

            await TemplateController.templateService.deleteTemplate(id, schoolId, userId);
            return res.status(200).json({ message: 'Template successfully deleted.' });
        } catch (error: any) {
            console.error('[DELETE TEMPLATE ERROR]', error);
            return res.status(error.status || 400).json({ error: error.message || 'Failed to delete template' });
        }
    }

    public static async updateTemplateSections(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            const { id } = req.params;
            if (!schoolId || !userId) {
                return res.status(400).json({ error: 'School or user context could not be resolved.' });
            }

            const template = await TemplateController.templateService.updateTemplateSections(id, schoolId, userId, req.body);
            return res.status(200).json(template);
        } catch (error: any) {
            console.error('[UPDATE TEMPLATE SECTIONS ERROR]', error);
            return res.status(error.status || 400).json({ error: error.message || 'Failed to update sections' });
        }
    }

    public static async publishTemplate(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            const { id } = req.params;
            if (!schoolId || !userId) {
                return res.status(400).json({ error: 'School or user context could not be resolved.' });
            }

            const result = await TemplateController.templateService.publishTemplate(id, schoolId, userId);
            return res.status(200).json(result);
        } catch (error: any) {
            console.error('[PUBLISH TEMPLATE ERROR]', error);
            return res.status(error.status || 400).json({ error: error.message || 'Failed to publish template' });
        }
    }

    public static async cloneTemplate(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            const { id } = req.params;
            if (!schoolId || !userId) {
                return res.status(400).json({ error: 'School or user context could not be resolved.' });
            }

            const template = await TemplateController.templateService.cloneTemplate(id, schoolId, userId);
            return res.status(201).json(template);
        } catch (error: any) {
            console.error('[CLONE TEMPLATE ERROR]', error);
            return res.status(error.status || 400).json({ error: error.message || 'Failed to clone template' });
        }
    }
}
