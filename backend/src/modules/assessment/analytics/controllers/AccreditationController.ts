import { Request, Response } from 'express';
import { AccreditationService } from '../services/AccreditationService';

export class AccreditationController {
    private static service = new AccreditationService();

    public static async compileReport(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            if (!schoolId || !userId) return res.status(400).json({ error: 'Context details missing.' });

            const { report_type } = req.body;
            const data = await AccreditationController.service.compileAccreditationReport(
                schoolId,
                report_type,
                userId
            );

            return res.status(200).json(data);
        } catch (error: any) {
            return res.status(400).json({ error: error.message || 'Failed to compile accreditation report.' });
        }
    }
}
export default AccreditationController;
