import { Request, Response } from 'express';
import { RiskPredictionService } from '../services/RiskPredictionService';

export class PredictionController {
    private static service = new RiskPredictionService();

    public static async processRiskScore(req: Request, res: Response): Promise<Response> {
        try {
            const { student_id } = req.body;
            const data = await PredictionController.service.processStudentRiskScore(student_id);
            return res.status(200).json(data);
        } catch (error: any) {
            return res.status(400).json({ error: error.message || 'Failed to process student risk score.' });
        }
    }
}
export default PredictionController;
