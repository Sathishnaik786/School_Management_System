import { Request, Response } from 'express';
import { EvaluationAnalyticsService } from '../services/EvaluationAnalyticsService';

export class EvaluationAnalyticsController {
    private static service = new EvaluationAnalyticsService();

    public static async getMetrics(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            if (!schoolId) return res.status(400).json({ error: 'School context could not be resolved.' });

            const metrics = await EvaluationAnalyticsController.service.getDashboardMetrics(schoolId);
            return res.status(200).json(metrics);
        } catch (error: any) {
            return res.status(500).json({ error: error.message || 'Failed to resolve metrics.' });
        }
    }
}
export default EvaluationAnalyticsController;
