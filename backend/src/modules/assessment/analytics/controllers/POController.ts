import { Request, Response } from 'express';
import { POAttainmentService } from '../services/POAttainmentService';

export class POController {
    private static service = new POAttainmentService();

    public static async calculateAttainment(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            if (!schoolId) return res.status(400).json({ error: 'School context credentials missing.' });

            const { po_code } = req.body;
            const data = await POController.service.calculatePoAttainment(schoolId, po_code);
            return res.status(200).json(data);
        } catch (error: any) {
            return res.status(400).json({ error: error.message || 'Failed to calculate program outcome attainment.' });
        }
    }
}
export default POController;
