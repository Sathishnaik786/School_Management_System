import { Request, Response } from 'express';
import { PaperWorkflowService } from '../services/PaperWorkflowService';
import { PaperValidator } from '../validators/PaperValidator';

export class PaperWorkflowController {
    private static workflowService = new PaperWorkflowService();

    public static async transitionStatus(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            if (!schoolId || !userId) return res.status(400).json({ error: 'Context credentials could not be resolved.' });

            const validated = PaperValidator.validateWorkflow(req.body);
            const result = await PaperWorkflowController.workflowService.transitionStatus(
                id,
                schoolId,
                userId,
                validated.target_status,
                validated.transition_reason
            );

            return res.status(200).json(result);
        } catch (error: any) {
            return res.status(error.status || 400).json({ error: error.message || 'Failed to transition paper status.' });
        }
    }
}
export default PaperWorkflowController;
