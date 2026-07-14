import { Request, Response } from 'express';
import { PaperRepository } from '../repositories/PaperRepository';
import { PaperGeneratorService } from '../services/PaperGeneratorService';
import { PaperValidator } from '../validators/PaperValidator';

export class PaperController {
    private static repo = new PaperRepository();
    private static generator = new PaperGeneratorService();

    public static async listPapers(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            if (!schoolId) return res.status(400).json({ error: 'School context could not be resolved.' });

            const { subjectId, status, page, limit } = req.query;
            const result = await PaperController.repo.listPapers(schoolId, {
                subjectId: subjectId ? String(subjectId) : undefined,
                status: status ? String(status) : undefined,
                page: page ? parseInt(String(page), 10) : 1,
                limit: limit ? parseInt(String(limit), 10) : 10
            });

            return res.status(200).json(result);
        } catch (error: any) {
            return res.status(500).json({ error: error.message || 'Failed to list papers.' });
        }
    }

    public static async getPaperById(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const schoolId = (req as any).context?.user?.school_id;
            if (!schoolId) return res.status(400).json({ error: 'School context could not be resolved.' });

            const paper = await PaperController.repo.findPaperById(id, schoolId);
            return res.status(200).json(paper);
        } catch (error: any) {
            return res.status(500).json({ error: error.message || 'Failed to fetch paper.' });
        }
    }

    public static async createPaper(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            if (!schoolId || !userId) return res.status(400).json({ error: 'Context credentials could not be resolved.' });

            const validated = PaperValidator.validateCreate(req.body);
            const paper = await PaperController.generator.generatePaper(schoolId, userId, {
                ...validated,
                description: validated.description ?? undefined
            });
            return res.status(201).json(paper);
        } catch (error: any) {
            return res.status(error.status || 400).json({ error: error.message || 'Failed to generate paper.' });
        }
    }

    public static async deletePaper(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const schoolId = (req as any).context?.user?.school_id;
            if (!schoolId) return res.status(400).json({ error: 'School context could not be resolved.' });

            await PaperController.repo.deletePaper(id, schoolId);
            return res.status(200).json({ message: 'Paper deleted successfully.' });
        } catch (error: any) {
            return res.status(500).json({ error: error.message || 'Failed to delete paper.' });
        }
    }
}
export default PaperController;
