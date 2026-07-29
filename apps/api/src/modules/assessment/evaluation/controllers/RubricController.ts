import { Request, Response } from 'express';
import { RubricService } from '../services/RubricService';
import { EvaluationValidator } from '../validators/EvaluationValidator';

export class RubricController {
    private static service = new RubricService();

    public static async listRubrics(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            if (!schoolId) return res.status(400).json({ error: 'School context could not be resolved.' });

            const data = await RubricController.service.listRubrics(schoolId);
            return res.status(200).json(data);
        } catch (error: any) {
            return res.status(500).json({ error: error.message || 'Failed to list rubrics.' });
        }
    }

    public static async createRubric(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            if (!schoolId) return res.status(400).json({ error: 'School context could not be resolved.' });

            const validated = EvaluationValidator.validateRubric(req.body);
            const data = await RubricController.service.createRubric(schoolId, validated);
            return res.status(201).json(data);
        } catch (error: any) {
            return res.status(400).json({ error: error.message || 'Failed to create rubric.' });
        }
    }
}
export default RubricController;
