import { Request, Response } from 'express';
import { ResultRepository } from '../repositories/ResultRepository';
import { ResultCalculationService } from '../services/ResultCalculationService';
import { ResultValidator } from '../validators/ResultValidator';

export class ResultController {
    private static repo = new ResultRepository();
    private static service = new ResultCalculationService();

    public static async listSessions(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            if (!schoolId) return res.status(400).json({ error: 'School context could not be resolved.' });

            const data = await ResultController.repo.listSessions(schoolId);
            return res.status(200).json(data);
        } catch (error: any) {
            return res.status(500).json({ error: error.message || 'Failed to list result sessions.' });
        }
    }

    public static async createSession(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            if (!schoolId || !userId) return res.status(400).json({ error: 'Context credentials missing.' });

            const validated = ResultValidator.validateCreateSession(req.body);
            const session = await ResultController.repo.createSession(schoolId, validated, userId);
            return res.status(201).json(session);
        } catch (error: any) {
            return res.status(400).json({ error: error.message || 'Failed to create session.' });
        }
    }

    public static async calculateResults(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            if (!schoolId || !userId) return res.status(400).json({ error: 'Context credentials missing.' });

            const validated = ResultValidator.validateCalculate(req.body);
            const session = await ResultController.service.calculateSessionResults(validated.session_id, schoolId, userId);
            return res.status(200).json(session);
        } catch (error: any) {
            return res.status(400).json({ error: error.message || 'Failed to calculate results.' });
        }
    }
}
export default ResultController;
