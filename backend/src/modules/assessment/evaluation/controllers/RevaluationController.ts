import { Request, Response } from 'express';
import { RevaluationRepository } from '../repositories/RevaluationRepository';
import { RevaluationService } from '../services/RevaluationService';
import { EvaluationValidator } from '../validators/EvaluationValidator';

export class RevaluationController {
    private static repo = new RevaluationRepository();
    private static service = new RevaluationService();

    public static async listRequests(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            if (!schoolId) return res.status(400).json({ error: 'School context could not be resolved.' });

            const data = await RevaluationController.repo.listRequests(schoolId);
            return res.status(200).json(data);
        } catch (error: any) {
            return res.status(500).json({ error: error.message || 'Failed to list revaluation requests.' });
        }
    }

    public static async apply(req: Request, res: Response): Promise<Response> {
        try {
            const validated = EvaluationValidator.validateRevaluation(req.body);
            const data = await RevaluationController.service.applyForRevaluation(
                validated.attempt_id,
                validated.student_id,
                validated.reason
            );

            return res.status(201).json(data);
        } catch (error: any) {
            return res.status(400).json({ error: error.message || 'Failed to file revaluation request.' });
        }
    }

    public static async approve(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params; // Request ID
            const { remarks } = req.body;
            const data = await RevaluationController.service.approveRevaluation(id, remarks);
            return res.status(200).json(data);
        } catch (error: any) {
            return res.status(400).json({ error: error.message || 'Failed to approve revaluation.' });
        }
    }
}
export default RevaluationController;
