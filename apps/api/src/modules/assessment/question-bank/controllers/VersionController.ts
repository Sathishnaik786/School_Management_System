import { Request, Response } from 'express';
import { QuestionVersionService } from '../services/QuestionVersionService';

export class VersionController {
    private static versionService = new QuestionVersionService();

    public static async getVersionsHistory(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params; // Question ID
            const schoolId = (req as any).context?.user?.school_id;
            if (!schoolId) return res.status(400).json({ error: 'School context could not be resolved.' });

            const versions = await VersionController.versionService.getVersionsHistory(id, schoolId);
            return res.status(200).json(versions);
        } catch (error: any) {
            return res.status(error.status || 500).json({ error: error.message || 'Failed to get version history.' });
        }
    }

    public static async restoreVersion(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params; // Question ID
            const { versionNumber } = req.body;
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            if (!schoolId || !userId || !versionNumber) {
                return res.status(400).json({ error: 'Context credentials and versionNumber are required.' });
            }

            const restored = await VersionController.versionService.restoreVersion(id, versionNumber, schoolId, userId);
            return res.status(200).json(restored);
        } catch (error: any) {
            return res.status(error.status || 400).json({ error: error.message || 'Failed to restore past version.' });
        }
    }
}
export default VersionController;
