import { Request, Response } from 'express';
import { AssessmentConfigurationService } from '../services/AssessmentConfigurationService';

export class AssessmentConfigurationController {
    private static configService = new AssessmentConfigurationService();

    public static async listConfigurations(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            if (!schoolId) {
                return res.status(400).json({ error: 'School context could not be resolved.' });
            }
            const configs = await AssessmentConfigurationController.configService.listAllConfigs(schoolId);
            return res.status(200).json(configs);
        } catch (error: any) {
            console.error('[CONFIG LIST ERROR]', error);
            return res.status(error.status || 500).json({ error: error.message || 'Failed to list configurations' });
        }
    }

    public static async getConfiguration(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const config = await AssessmentConfigurationController.configService.getConfigById(id);
            return res.status(200).json(config);
        } catch (error: any) {
            console.error('[CONFIG GET ERROR]', error);
            return res.status(error.status || 500).json({ error: error.message || 'Failed to fetch configuration' });
        }
    }

    public static async createConfiguration(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            if (!schoolId || !userId) {
                return res.status(400).json({ error: 'Context credentials could not be resolved.' });
            }
            const config = await AssessmentConfigurationController.configService.createConfig(schoolId, userId, req.body);
            return res.status(201).json(config);
        } catch (error: any) {
            console.error('[CONFIG CREATE ERROR]', error);
            return res.status(error.status || 400).json({ error: error.message || 'Failed to create configuration' });
        }
    }

    public static async updateConfiguration(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            if (!schoolId || !userId) {
                return res.status(400).json({ error: 'Context credentials could not be resolved.' });
            }
            const config = await AssessmentConfigurationController.configService.updateConfig(id, schoolId, userId, req.body);
            return res.status(200).json(config);
        } catch (error: any) {
            console.error('[CONFIG UPDATE ERROR]', error);
            return res.status(error.status || 400).json({ error: error.message || 'Failed to update configuration' });
        }
    }

    public static async deleteConfiguration(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            if (!schoolId || !userId) {
                return res.status(400).json({ error: 'Context credentials could not be resolved.' });
            }
            await AssessmentConfigurationController.configService.deleteConfig(id, schoolId, userId);
            return res.status(200).json({ message: 'Configuration successfully deleted.' });
        } catch (error: any) {
            console.error('[CONFIG DELETE ERROR]', error);
            return res.status(error.status || 400).json({ error: error.message || 'Failed to delete configuration' });
        }
    }

    public static async cloneConfiguration(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.body; // target configuration ID to clone
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            if (!schoolId || !userId || !id) {
                return res.status(400).json({ error: 'Target configuration ID and context credentials are required.' });
            }
            const cloned = await AssessmentConfigurationController.configService.cloneConfig(id, schoolId, userId);
            return res.status(201).json(cloned);
        } catch (error: any) {
            console.error('[CONFIG CLONE ERROR]', error);
            return res.status(error.status || 400).json({ error: error.message || 'Failed to clone configuration' });
        }
    }

    public static async resetConfiguration(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.body;
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            if (!schoolId || !userId || !id) {
                return res.status(400).json({ error: 'Target configuration ID and context credentials are required.' });
            }
            const reset = await AssessmentConfigurationController.configService.resetConfig(id, schoolId, userId);
            return res.status(200).json(reset);
        } catch (error: any) {
            console.error('[CONFIG RESET ERROR]', error);
            return res.status(error.status || 400).json({ error: error.message || 'Failed to reset configuration' });
        }
    }

    public static async validateConfiguration(req: Request, res: Response): Promise<Response> {
        try {
            const validated = AssessmentConfigurationController.configService.validateConfig(req.body);
            return res.status(200).json({ valid: true, data: validated });
        } catch (error: any) {
            return res.status(400).json({ valid: false, error: error.message });
        }
    }
}
