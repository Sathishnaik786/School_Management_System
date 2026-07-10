import { Request, Response } from 'express';
import { AttendanceWorkflowService } from '../services/AttendanceWorkflowService';
import { AttendanceValidator } from '../validators/AttendanceValidator';

export class AttendanceWorkflowController {
    private static workflowService = new AttendanceWorkflowService();

    public static async transitionSession(req: Request, res: Response): Promise<Response> {
        try {
            const userId = (req as any).context?.user?.id;
            if (!userId) return res.status(400).json({ error: 'Context details missing.' });

            const validated = AttendanceValidator.validateTransitionWorkflow(req.body);
            const session = await AttendanceWorkflowController.workflowService.transitionSessionWorkflow(
                validated.session_id,
                validated.decision,
                userId,
                validated.comments || undefined
            );

            return res.status(200).json(session);
        } catch (error: any) {
            return res.status(400).json({ error: error.message || 'Failed to transition workflow.' });
        }
    }
}
export default AttendanceWorkflowController;
