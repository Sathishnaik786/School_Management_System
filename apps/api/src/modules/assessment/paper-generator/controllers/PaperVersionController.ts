import { Request, Response } from 'express';
import { PaperVersionService } from '../services/PaperVersionService';

export class PaperVersionController {
    private static versionService = new PaperVersionService();

    public static async getHistory(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const history = await PaperVersionController.versionService.getHistory(id);
            return res.status(200).json(history);
        } catch (error: any) {
            return res.status(500).json({ error: error.message || 'Failed to fetch versions history.' });
        }
    }
}
export default PaperVersionController;
