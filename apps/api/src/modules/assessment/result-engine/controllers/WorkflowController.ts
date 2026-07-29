import { Request, Response } from 'express';
import { ResultWorkflowService } from '../services/ResultWorkflowService';
import { ResultValidator } from '../validators/ResultValidator';

export class WorkflowController {
    private static service = new ResultWorkflowService();

    public static async transitionStatus(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params; // Session ID
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            if (!schoolId || !userId) return res.status(400).json({ error: 'Context credentials missing.' });

            const validated = ResultValidator.validateWorkflow(req.body);
            const result = await WorkflowController.service.transitionWorkflow(
                id,
                schoolId,
                userId,
                validated.target_status,
                validated.comments || undefined
            );

            return res.status(200).json(result);
        } catch (error: any) {
            return res.status(400).json({ error: error.message || 'Failed to transition workflow status.' });
        }
    }
}
export default WorkflowController;
