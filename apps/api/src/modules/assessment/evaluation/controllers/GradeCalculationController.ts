import { Request, Response } from 'express';
import { GradeCalculationService } from '../services/GradeCalculationService';
import { GradeCalculationRepository } from '../repositories/GradeCalculationRepository';
import { EvaluationValidator } from '../validators/EvaluationValidator';

export class GradeCalculationController {
    private static service = new GradeCalculationService();
    private static repo = new GradeCalculationRepository();

    public static async calculateGrade(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            if (!schoolId || !userId) return res.status(400).json({ error: 'Context credentials missing.' });

            const { attempt_id } = req.body;
            const data = await GradeCalculationController.service.calculateGrade(schoolId, attempt_id, userId);
            return res.status(200).json(data);
        } catch (error: any) {
            return res.status(400).json({ error: error.message || 'Failed to calculate grade.' });
        }
    }

    public static async getCalculationByAttempt(req: Request, res: Response): Promise<Response> {
        try {
            const { attemptId } = req.params;
            const schoolId = (req as any).context?.user?.school_id;
            if (!schoolId) return res.status(400).json({ error: 'School context could not be resolved.' });

            const data = await GradeCalculationController.repo.findByAttemptId(attemptId, schoolId);
            return res.status(200).json(data);
        } catch (error: any) {
            return res.status(500).json({ error: error.message || 'Failed to fetch grade calculations.' });
        }
    }
}
export default GradeCalculationController;
