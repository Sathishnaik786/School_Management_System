import { Request, Response } from 'express';
import { QuestionAnalyticsService } from '../services/QuestionAnalyticsService';

export class QuestionStatisticsController {
    private static service = new QuestionAnalyticsService();

    public static async calculateQuestionStats(req: Request, res: Response): Promise<Response> {
        try {
            const { question_snapshot_id } = req.body;
            const data = await QuestionStatisticsController.service.calculateQuestionStats(question_snapshot_id);
            return res.status(200).json(data);
        } catch (error: any) {
            return res.status(400).json({ error: error.message || 'Failed to calculate question stats.' });
        }
    }
}
export default QuestionStatisticsController;
