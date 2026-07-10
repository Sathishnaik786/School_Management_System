import { Request, Response } from 'express';
import { PromotionEngine } from '../services/PromotionEngine';
import { ResultValidator } from '../validators/ResultValidator';

export class PromotionController {
    private static service = new PromotionEngine();

    public static async processPromotion(req: Request, res: Response): Promise<Response> {
        try {
            const userId = (req as any).context?.user?.id;
            if (!userId) return res.status(400).json({ error: 'Context credentials missing.' });

            const validated = ResultValidator.validatePromotion(req.body);
            const decision = await PromotionController.service.processStudentPromotion(
                validated.student_id,
                validated.academic_year_id,
                req.body.gpa || 0.00,
                req.body.backlogs_count || 0,
                userId
            );

            return res.status(201).json(decision);
        } catch (error: any) {
            return res.status(400).json({ error: error.message || 'Failed to process student promotion.' });
        }
    }
}
export default PromotionController;
