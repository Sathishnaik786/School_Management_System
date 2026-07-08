import { Request, Response } from 'express';
import { ConfigService } from '../services/config.service';

export class ConfigController {
    private static configService = new ConfigService();

    /**
     * Resolves and returns the configuration for the authenticated school tenant.
     */
    public static async getConfig(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            if (!schoolId) {
                return res.status(400).json({ error: 'School context could not be resolved from session.' });
            }

            const config = await ConfigController.configService.getConfig(schoolId);
            return res.status(200).json(config);
        } catch (error: any) {
            console.error('[ASSESSMENT CONFIG GET ERROR]', error);
            return res.status(error.status || 500).json({ error: error.message || 'Failed to fetch configuration' });
        }
    }

    /**
     * Validates and updates the configuration for the authenticated school tenant.
     */
    public static async updateConfig(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            if (!schoolId || !userId) {
                return res.status(400).json({ error: 'School or User context could not be resolved from session.' });
            }

            const config = await ConfigController.configService.updateConfig(schoolId, userId, req.body);
            return res.status(200).json(config);
        } catch (error: any) {
            console.error('[ASSESSMENT CONFIG UPDATE ERROR]', error);
            return res.status(error.status || 400).json({ error: error.message || 'Failed to update configuration' });
        }
    }
}
