import { Request, Response } from 'express';
import { AnalyticsRepository } from '../repositories/AnalyticsRepository';
import { AnalyticsValidator } from '../validators/AnalyticsValidator';

export class AnalyticsController {
    private static repo = new AnalyticsRepository();

    public static async saveSnapshot(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            if (!schoolId) return res.status(400).json({ error: 'School context credentials missing.' });

            const validated = AnalyticsValidator.validateSnapshot(req.body);
            const data = await AnalyticsController.repo.saveSnapshot(schoolId, validated);
            return res.status(201).json(data);
        } catch (error: any) {
            return res.status(400).json({ error: error.message || 'Failed to capture snapshot.' });
        }
    }

    public static async listSnapshots(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            if (!schoolId) return res.status(400).json({ error: 'School context credentials missing.' });

            const { type } = req.query;
            const data = await AnalyticsController.repo.getSnapshots(schoolId, type ? String(type) : undefined);
            return res.status(200).json(data);
        } catch (error: any) {
            return res.status(500).json({ error: error.message || 'Failed to list snapshots.' });
        }
    }
}
export default AnalyticsController;
