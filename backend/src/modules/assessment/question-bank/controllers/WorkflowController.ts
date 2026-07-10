import { Request, Response } from 'express';
import { QuestionWorkflowService } from '../services/QuestionWorkflowService';

export class WorkflowController {
    private static workflowService = new QuestionWorkflowService();

    public static async transitionQuestion(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params; // Question ID
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            if (!schoolId || !userId) return res.status(400).json({ error: 'Context credentials could not be resolved.' });

            const result = await WorkflowController.workflowService.transitionStatus(id, schoolId, userId, req.body);
            return res.status(200).json(result);
        } catch (error: any) {
            return res.status(error.status || 400).json({ error: error.message || 'Failed to transition question.' });
        }
    }
}
export default WorkflowController;
