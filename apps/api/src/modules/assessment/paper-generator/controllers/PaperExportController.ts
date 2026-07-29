import { Request, Response } from 'express';
import { PaperExportService } from '../services/PaperExportService';
import { PaperValidator } from '../validators/PaperValidator';

export class PaperExportController {
    private static exportService = new PaperExportService();

    public static async exportPaper(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const userId = (req as any).context?.user?.id;
            if (!userId) return res.status(400).json({ error: 'User context could not be resolved.' });

            const validated = PaperValidator.validateExport(req.body);
            const log = await PaperExportController.exportService.triggerExport(
                id,
                validated.format,
                validated.type,
                userId
            );

            return res.status(200).json(log);
        } catch (error: any) {
            return res.status(error.status || 400).json({ error: error.message || 'Failed to trigger paper export.' });
        }
    }
}
export default PaperExportController;
