import { Request, Response } from 'express';
import { BlueprintVersionService } from '../services/BlueprintVersionService';

export class BlueprintVersionController {
    private static versionService = new BlueprintVersionService();

    public static async getHistory(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params; // Blueprint ID
            const schoolId = (req as any).context?.user?.school_id;
            if (!schoolId) return res.status(400).json({ error: 'School context could not be resolved.' });

            const history = await BlueprintVersionController.versionService.getHistory(id, schoolId);
            return res.status(200).json(history);
        } catch (error: any) {
            return res.status(500).json({ error: error.message || 'Failed to fetch history timeline.' });
        }
    }

    public static async restoreVersion(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params; // Blueprint ID
            const { versionNumber } = req.body;
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            if (!schoolId || !userId || !versionNumber) {
                return res.status(400).json({ error: 'Context credentials and versionNumber are required.' });
            }

            const restored = await BlueprintVersionController.versionService.restoreVersion(id, versionNumber, schoolId, userId);
            return res.status(200).json(restored);
        } catch (error: any) {
            return res.status(error.status || 400).json({ error: error.message || 'Failed to rollback blueprint.' });
        }
    }
}
export default BlueprintVersionController;
