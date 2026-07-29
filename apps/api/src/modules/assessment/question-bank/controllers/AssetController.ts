import { Request, Response } from 'express';
import { QuestionAssetService } from '../services/QuestionAssetService';

export class AssetController {
    private static assetService = new QuestionAssetService();

    public static async uploadAsset(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            if (!schoolId || !userId) return res.status(400).json({ error: 'Context credentials could not be resolved.' });

            if (!req.body.file_name || !req.body.file_path) {
                return res.status(400).json({ error: 'Missing attachment params.' });
            }

            const asset = await AssetController.assetService.uploadAsset(schoolId, userId, req.body);
            return res.status(201).json(asset);
        } catch (error: any) {
            return res.status(error.status || 400).json({ error: error.message || 'Failed to upload asset.' });
        }
    }

    public static async linkAsset(req: Request, res: Response): Promise<Response> {
        try {
            const { questionId, assetId } = req.body;
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            if (!schoolId || !userId || !questionId || !assetId) {
                return res.status(400).json({ error: 'Missing linking credentials or target asset IDs.' });
            }

            await AssetController.assetService.linkAsset(questionId, assetId, schoolId, userId);
            return res.status(200).json({ message: 'Asset linked successfully.' });
        } catch (error: any) {
            return res.status(error.status || 400).json({ error: error.message || 'Failed to link asset.' });
        }
    }

    public static async unlinkAsset(req: Request, res: Response): Promise<Response> {
        try {
            const { questionId, assetId } = req.body;
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            if (!schoolId || !userId || !questionId || !assetId) {
                return res.status(400).json({ error: 'Missing linking credentials or target asset IDs.' });
            }

            await AssetController.assetService.unlinkAsset(questionId, assetId, schoolId, userId);
            return res.status(200).json({ message: 'Asset unlinked successfully.' });
        } catch (error: any) {
            return res.status(error.status || 400).json({ error: error.message || 'Failed to unlink asset.' });
        }
    }

    public static async getQuestionAssets(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params; // Question ID
            const assets = await AssetController.assetService.getQuestionAssets(id);
            return res.status(200).json(assets);
        } catch (error: any) {
            return res.status(500).json({ error: error.message || 'Failed to get assets.' });
        }
    }

    public static async deleteAsset(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params; // Asset ID
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            if (!schoolId || !userId) return res.status(400).json({ error: 'Context credentials could not be resolved.' });

            await AssetController.assetService.deleteAsset(id, schoolId, userId);
            return res.status(200).json({ message: 'Asset successfully deleted.' });
        } catch (error: any) {
            return res.status(error.status || 400).json({ error: error.message || 'Failed to delete asset.' });
        }
    }
}
export default AssetController;
