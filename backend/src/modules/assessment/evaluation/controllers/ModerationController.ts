import { Request, Response } from 'express';
import { ModerationRepository } from '../repositories/ModerationRepository';
import { ModerationService } from '../services/ModerationService';
import { EvaluationValidator } from '../validators/EvaluationValidator';

export class ModerationController {
    private static repo = new ModerationRepository();
    private static service = new ModerationService();

    public static async listQueue(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            if (!schoolId) return res.status(400).json({ error: 'School context could not be resolved.' });

            const data = await ModerationController.repo.getQueue(schoolId);
            return res.status(200).json(data);
        } catch (error: any) {
            return res.status(500).json({ error: error.message || 'Failed to list moderation queue.' });
        }
    }

    public static async resolveModeration(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params; // Queue ID
            const moderatorId = (req as any).context?.user?.id;
            if (!moderatorId) return res.status(400).json({ error: 'Moderator session credentials missing.' });

            const validated = EvaluationValidator.validateModeration(req.body);
            const result = await ModerationController.service.resolveModeration(
                id,
                moderatorId,
                validated.moderator_marks,
                validated.status
            );

            return res.status(200).json(result);
        } catch (error: any) {
            return res.status(400).json({ error: error.message || 'Failed to resolve moderation item.' });
        }
    }
}
export default ModerationController;
