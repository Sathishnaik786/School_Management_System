import { Request, Response } from 'express';
import { PaperValidationEngine } from '../services/PaperValidationEngine';

export class PaperValidationController {
    private static validationEngine = new PaperValidationEngine();

    public static async validatePaper(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            if (!schoolId) return res.status(400).json({ error: 'School context could not be resolved.' });

            const report = await PaperValidationController.validationEngine.validatePaper(id, schoolId, userId);
            return res.status(200).json(report);
        } catch (error: any) {
            return res.status(500).json({ error: error.message || 'Failed to execute validation pipeline.' });
        }
    }
}
export default PaperValidationController;
