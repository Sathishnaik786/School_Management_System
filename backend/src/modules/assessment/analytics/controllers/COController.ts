import { Request, Response } from 'express';
import { COAttainmentService } from '../services/COAttainmentService';

export class COController {
    private static service = new COAttainmentService();

    public static async calculateAttainment(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            if (!schoolId) return res.status(400).json({ error: 'School context credentials missing.' });

            const { subject_id, co_code } = req.body;
            const data = await COController.service.calculateCoAttainment(schoolId, subject_id, co_code);
            return res.status(200).json(data);
        } catch (error: any) {
            return res.status(400).json({ error: error.message || 'Failed to calculate course outcome attainment.' });
        }
    }
}
export default COController;
