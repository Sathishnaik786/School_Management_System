import { Request, Response } from 'express';
import { ResultPublicationService } from '../services/ResultPublicationService';
import { ResultValidator } from '../validators/ResultValidator';

export class PublicationController {
    private static service = new ResultPublicationService();

    public static async publishResults(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params; // Session ID
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            if (!schoolId || !userId) return res.status(400).json({ error: 'Context credentials missing.' });

            const validated = ResultValidator.validatePublish(req.body);
            const pub = await PublicationController.service.publishResults(
                id,
                schoolId,
                validated.target_portal,
                userId
            );

            return res.status(200).json(pub);
        } catch (error: any) {
            return res.status(400).json({ error: error.message || 'Failed to publish results.' });
        }
    }
}
export default PublicationController;
