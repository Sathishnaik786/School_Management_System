import { Request, Response } from 'express';
import { TemplateAnalyticsService } from '../services/TemplateAnalyticsService';

export class TemplateAnalyticsController {
    private static analyticsService = new TemplateAnalyticsService();

    public static async getMetrics(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            if (!schoolId) return res.status(400).json({ error: 'School context could not be resolved.' });

            const metrics = await TemplateAnalyticsController.analyticsService.getMetrics(schoolId);
            return res.status(200).json(metrics);
        } catch (error: any) {
            return res.status(500).json({ error: error.message || 'Failed to fetch metrics.' });
        }
    }
}
export default TemplateAnalyticsController;
