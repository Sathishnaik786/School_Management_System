import { Request, Response } from 'express';
import { RankingEngine } from '../services/RankingEngine';

export class RankingController {
    private static service = new RankingEngine();

    public static async calculateRankings(req: Request, res: Response): Promise<Response> {
        try {
            const { sessionId } = req.body;
            await RankingController.service.calculateCohortRankings(sessionId);
            return res.status(200).json({ message: 'Cohort rankings successfully calculated!' });
        } catch (error: any) {
            return res.status(400).json({ error: error.message || 'Failed to calculate rankings.' });
        }
    }
}
export default RankingController;
