import { Request, Response } from 'express';
import { BlueprintService } from '../services/BlueprintService';
import { BlueprintRuleEngineService } from '../services/BlueprintRuleEngineService';

export class BlueprintController {
    private static blueprintService = new BlueprintService();
    private static ruleEngine = new BlueprintRuleEngineService();

    public static async listBlueprints(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            if (!schoolId) return res.status(400).json({ error: 'School context could not be resolved.' });

            const queryParams = {
                ...req.query,
                page: req.query.page ? parseInt(String(req.query.page), 10) : 1,
                limit: req.query.limit ? parseInt(String(req.query.limit), 10) : 10
            };

            const result = await BlueprintController.blueprintService.listBlueprints(schoolId, queryParams);
            return res.status(200).json(result);
        } catch (error: any) {
            return res.status(error.status || 500).json({ error: error.message || 'Failed to list blueprints' });
        }
    }

    public static async getBlueprintById(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const schoolId = (req as any).context?.user?.school_id;
            if (!schoolId) return res.status(400).json({ error: 'School context could not be resolved.' });

            const blueprint = await BlueprintController.blueprintService.getBlueprintById(id, schoolId);
            return res.status(200).json(blueprint);
        } catch (error: any) {
            return res.status(error.status || 500).json({ error: error.message || 'Failed to fetch blueprint' });
        }
    }

    public static async createBlueprint(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            if (!schoolId || !userId) return res.status(400).json({ error: 'Context credentials could not be resolved.' });

            const blueprint = await BlueprintController.blueprintService.createBlueprint(schoolId, userId, req.body);
            return res.status(201).json(blueprint);
        } catch (error: any) {
            return res.status(error.status || 400).json({ error: error.message || 'Failed to create blueprint' });
        }
    }

    public static async updateBlueprint(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            if (!schoolId || !userId) return res.status(400).json({ error: 'Context credentials could not be resolved.' });

            const blueprint = await BlueprintController.blueprintService.updateBlueprint(id, schoolId, userId, req.body);
            return res.status(200).json(blueprint);
        } catch (error: any) {
            return res.status(error.status || 400).json({ error: error.message || 'Failed to update blueprint' });
        }
    }

    public static async deleteBlueprint(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            if (!schoolId || !userId) return res.status(400).json({ error: 'Context credentials could not be resolved.' });

            await BlueprintController.blueprintService.deleteBlueprint(id, schoolId, userId);
            return res.status(200).json({ message: 'Blueprint successfully deleted.' });
        } catch (error: any) {
            return res.status(error.status || 400).json({ error: error.message || 'Failed to delete blueprint' });
        }
    }

    public static async cloneBlueprint(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            if (!schoolId || !userId) return res.status(400).json({ error: 'Context credentials could not be resolved.' });

            const cloned = await BlueprintController.blueprintService.cloneBlueprint(id, schoolId, userId, req.body);
            return res.status(201).json(cloned);
        } catch (error: any) {
            return res.status(error.status || 400).json({ error: error.message || 'Failed to clone blueprint' });
        }
    }

    public static async validateBlueprint(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            if (!schoolId) return res.status(400).json({ error: 'School context could not be resolved.' });

            const report = await BlueprintController.ruleEngine.validateBlueprint(schoolId, req.body);
            return res.status(200).json(report);
        } catch (error: any) {
            return res.status(500).json({ error: error.message || 'Validation execution failed.' });
        }
    }
}
export default BlueprintController;
