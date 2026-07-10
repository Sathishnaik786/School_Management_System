import { Request, Response } from 'express';
import { TemplateWorkflowService } from '../services/TemplateWorkflowService';

export class TemplateWorkflowController {
    private static workflowService = new TemplateWorkflowService();

    public static async transitionTemplate(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            if (!schoolId || !userId) return res.status(400).json({ error: 'Context credentials could not be resolved.' });

            const result = await TemplateWorkflowController.workflowService.transitionStatus(id, schoolId, userId, req.body);
            return res.status(200).json(result);
        } catch (error: any) {
            return res.status(error.status || 400).json({ error: error.message || 'Failed to transition template status.' });
        }
    }
}
export default TemplateWorkflowController;
