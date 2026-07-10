import { Request, Response } from 'express';
import { EvaluationRepository } from '../repositories/EvaluationRepository';
import { EvaluationService } from '../services/EvaluationService';
import { EvaluationWorkflowService } from '../services/EvaluationWorkflowService';
import { EvaluationValidator } from '../validators/EvaluationValidator';

export class EvaluationController {
    private static repo = new EvaluationRepository();
    private static service = new EvaluationService();
    private static workflow = new EvaluationWorkflowService();

    public static async listSessions(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            if (!schoolId) return res.status(400).json({ error: 'School context could not be resolved.' });

            const { status } = req.query;
            const data = await EvaluationController.repo.listSessions(schoolId, status ? String(status) : undefined);
            return res.status(200).json(data);
        } catch (error: any) {
            return res.status(500).json({ error: error.message || 'Failed to list evaluation sessions.' });
        }
    }

    public static async getSessionById(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const schoolId = (req as any).context?.user?.school_id;
            if (!schoolId) return res.status(400).json({ error: 'School context could not be resolved.' });

            const data = await EvaluationController.repo.findSessionById(id, schoolId);
            return res.status(200).json(data);
        } catch (error: any) {
            return res.status(500).json({ error: error.message || 'Failed to fetch session details.' });
        }
    }

    public static async startSession(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            if (!schoolId || !userId) return res.status(400).json({ error: 'Authentication details missing.' });

            const validated = EvaluationValidator.validateStart(req.body);
            const session = await EvaluationController.service.startEvaluationSession(schoolId, userId, validated);
            return res.status(201).json(session);
        } catch (error: any) {
            return res.status(400).json({ error: error.message || 'Failed to start evaluation session.' });
        }
    }

    public static async evaluateQuestion(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params; // Session ID
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            if (!schoolId || !userId) return res.status(400).json({ error: 'Authentication details missing.' });

            const validated = EvaluationValidator.validateQuestionScore(req.body);
            const result = await EvaluationController.service.evaluateQuestion(id, schoolId, userId, validated);
            return res.status(200).json(result);
        } catch (error: any) {
            return res.status(400).json({ error: error.message || 'Failed to evaluate question.' });
        }
    }

    public static async transitionWorkflow(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params; // Session ID
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            if (!schoolId || !userId) return res.status(400).json({ error: 'Authentication details missing.' });

            const { target_status } = req.body;
            const session = await EvaluationController.workflow.transitionSessionWorkflow(id, schoolId, userId, target_status);
            return res.status(200).json(session);
        } catch (error: any) {
            return res.status(400).json({ error: error.message || 'Failed to transition workflow status.' });
        }
    }
}
export default EvaluationController;
