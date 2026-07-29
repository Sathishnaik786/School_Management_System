import { Request, Response } from 'express';
import { BlueprintWorkflowService } from '../services/BlueprintWorkflowService';

export class BlueprintWorkflowController {
    private static workflowService = new BlueprintWorkflowService();

    public static async transitionBlueprint(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params; // Blueprint ID
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            if (!schoolId || !userId) return res.status(400).json({ error: 'Context credentials could not be resolved.' });

            const result = await BlueprintWorkflowController.workflowService.transitionStatus(id, schoolId, userId, req.body);
            return res.status(200).json(result);
        } catch (error: any) {
            return res.status(error.status || 400).json({ error: error.message || 'Failed to transition blueprint status.' });
        }
    }
}
export default BlueprintWorkflowController;
