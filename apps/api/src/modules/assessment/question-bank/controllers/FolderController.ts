import { Request, Response } from 'express';
import { QuestionFolderService } from '../services/QuestionFolderService';

export class FolderController {
    private static folderService = new QuestionFolderService();

    public static async listFolders(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            if (!schoolId) return res.status(400).json({ error: 'School context could not be resolved.' });
            
            const folders = await FolderController.folderService.getFolders(schoolId);
            return res.status(200).json(folders);
        } catch (error: any) {
            return res.status(error.status || 500).json({ error: error.message || 'Failed to list folders' });
        }
    }

    public static async createFolder(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            if (!schoolId || !userId) return res.status(400).json({ error: 'Context credentials could not be resolved.' });

            const folder = await FolderController.folderService.createFolder(schoolId, userId, req.body);
            return res.status(201).json(folder);
        } catch (error: any) {
            return res.status(error.status || 400).json({ error: error.message || 'Failed to create folder' });
        }
    }

    public static async updateFolder(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            if (!schoolId || !userId) return res.status(400).json({ error: 'Context credentials could not be resolved.' });

            const folder = await FolderController.folderService.updateFolder(id, schoolId, userId, req.body);
            return res.status(200).json(folder);
        } catch (error: any) {
            return res.status(error.status || 400).json({ error: error.message || 'Failed to update folder' });
        }
    }

    public static async deleteFolder(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            if (!schoolId || !userId) return res.status(400).json({ error: 'Context credentials could not be resolved.' });

            await FolderController.folderService.deleteFolder(id, schoolId, userId);
            return res.status(200).json({ message: 'Folder successfully deleted.' });
        } catch (error: any) {
            return res.status(error.status || 400).json({ error: error.message || 'Failed to delete folder' });
        }
    }

    public static async bulkMoveQuestions(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            if (!schoolId || !userId) return res.status(400).json({ error: 'Context credentials could not be resolved.' });

            await FolderController.folderService.bulkMoveQuestions(schoolId, userId, req.body);
            return res.status(200).json({ message: 'Questions successfully moved.' });
        } catch (error: any) {
            return res.status(error.status || 400).json({ error: error.message || 'Failed to move questions.' });
        }
    }

    public static async bulkCopyQuestions(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            if (!schoolId || !userId) return res.status(400).json({ error: 'Context credentials could not be resolved.' });

            await FolderController.folderService.bulkCopyQuestions(schoolId, userId, req.body);
            return res.status(200).json({ message: 'Questions successfully copied.' });
        } catch (error: any) {
            return res.status(error.status || 400).json({ error: error.message || 'Failed to copy questions.' });
        }
    }

    public static async getFolderStatistics(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            if (!schoolId) return res.status(400).json({ error: 'School context could not be resolved.' });

            const stats = await FolderController.folderService.getStatistics(schoolId);
            return res.status(200).json(stats);
        } catch (error: any) {
            return res.status(500).json({ error: error.message || 'Failed to fetch statistics.' });
        }
    }
}
export default FolderController;
