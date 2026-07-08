import { Request, Response } from 'express';
import { QuestionService } from '../services/question.service';
import { ImportExportService } from '../services/import-export.service';

export class QuestionController {
    private static questionService = new QuestionService();
    private static importService = new ImportExportService();

    // ==========================================
    // FOLDERS CONTROLLERS
    // ==========================================

    public static async listFolders(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            if (!schoolId) {
                return res.status(400).json({ error: 'School context could not be resolved.' });
            }

            const folders = await QuestionController.questionService.listFolders(schoolId);
            return res.status(200).json(folders);
        } catch (error: any) {
            console.error('[LIST FOLDERS ERROR]', error);
            return res.status(error.status || 500).json({ error: error.message || 'Failed to list folders' });
        }
    }

    public static async createFolder(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            if (!schoolId || !userId) {
                return res.status(400).json({ error: 'School or user context could not be resolved.' });
            }

            const folder = await QuestionController.questionService.createFolder(schoolId, userId, req.body);
            return res.status(201).json(folder);
        } catch (error: any) {
            console.error('[CREATE FOLDER ERROR]', error);
            return res.status(error.status || 400).json({ error: error.message || 'Failed to create folder' });
        }
    }

    public static async updateFolder(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            const { id } = req.params;
            if (!schoolId || !userId) {
                return res.status(400).json({ error: 'School or user context could not be resolved.' });
            }

            const folder = await QuestionController.questionService.updateFolder(id, schoolId, userId, req.body);
            return res.status(200).json(folder);
        } catch (error: any) {
            console.error('[UPDATE FOLDER ERROR]', error);
            return res.status(error.status || 400).json({ error: error.message || 'Failed to update folder' });
        }
    }

    public static async deleteFolder(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            const { id } = req.params;
            if (!schoolId || !userId) {
                return res.status(400).json({ error: 'School or user context could not be resolved.' });
            }

            await QuestionController.questionService.deleteFolder(id, schoolId, userId);
            return res.status(200).json({ message: 'Folder successfully deleted.' });
        } catch (error: any) {
            console.error('[DELETE FOLDER ERROR]', error);
            return res.status(error.status || 400).json({ error: error.message || 'Failed to delete folder' });
        }
    }

    // ==========================================
    // QUESTIONS CONTROLLERS
    // ==========================================

    public static async listQuestions(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            if (!schoolId) {
                return res.status(400).json({ error: 'School context could not be resolved.' });
            }

            const { folderId, subjectId, difficulty, bloomLevel, status, search, page, limit } = req.query;

            // Resolve folderId filters: 'root' maps to null context folder
            const folderFilter = folderId === 'root' ? null : (folderId ? String(folderId) : undefined);

            const result = await QuestionController.questionService.listQuestions(schoolId, {
                folderId: folderFilter,
                subjectId: subjectId ? String(subjectId) : undefined,
                difficulty: difficulty ? String(difficulty) : undefined,
                bloomLevel: bloomLevel ? String(bloomLevel) : undefined,
                status: status ? String(status) : undefined,
                search: search ? String(search) : undefined,
                page: page ? parseInt(String(page), 10) : 1,
                limit: limit ? parseInt(String(limit), 10) : 10
            });

            return res.status(200).json(result);
        } catch (error: any) {
            console.error('[LIST QUESTIONS ERROR]', error);
            return res.status(error.status || 500).json({ error: error.message || 'Failed to list questions' });
        }
    }

    public static async getQuestionById(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const { id } = req.params;
            if (!schoolId) {
                return res.status(400).json({ error: 'School context could not be resolved.' });
            }

            const question = await QuestionController.questionService.getQuestionById(id, schoolId);
            return res.status(200).json(question);
        } catch (error: any) {
            console.error('[GET QUESTION ERROR]', error);
            return res.status(error.status || 500).json({ error: error.message || 'Failed to fetch question' });
        }
    }

    public static async createQuestion(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            if (!schoolId || !userId) {
                return res.status(400).json({ error: 'School or user context could not be resolved.' });
            }

            const question = await QuestionController.questionService.createQuestion(schoolId, userId, req.body);
            return res.status(201).json(question);
        } catch (error: any) {
            console.error('[CREATE QUESTION ERROR]', error);
            return res.status(error.status || 400).json({ error: error.message || 'Failed to create question' });
        }
    }

    public static async updateQuestion(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            const { id } = req.params;
            if (!schoolId || !userId) {
                return res.status(400).json({ error: 'School or user context could not be resolved.' });
            }

            const question = await QuestionController.questionService.updateQuestion(id, schoolId, userId, req.body);
            return res.status(200).json(question);
        } catch (error: any) {
            console.error('[UPDATE QUESTION ERROR]', error);
            return res.status(error.status || 400).json({ error: error.message || 'Failed to update question' });
        }
    }

    public static async deleteQuestion(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            const { id } = req.params;
            if (!schoolId || !userId) {
                return res.status(400).json({ error: 'School or user context could not be resolved.' });
            }

            await QuestionController.questionService.deleteQuestion(id, schoolId, userId);
            return res.status(200).json({ message: 'Question successfully deleted.' });
        } catch (error: any) {
            console.error('[DELETE QUESTION ERROR]', error);
            return res.status(error.status || 400).json({ error: error.message || 'Failed to delete question' });
        }
    }

    /**
     * Handles multipart file uploads or raw payload parser checks for CSV ingestion.
     */
    public static async importQuestions(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            if (!schoolId || !userId) {
                return res.status(400).json({ error: 'School or user context could not be resolved.' });
            }

            const { academicYearId, subjectId, folderId, csv } = req.body;

            // Reading buffer from multer or direct parameter string
            let fileContent = '';
            if (req.file) {
                fileContent = req.file.buffer.toString('utf8');
            } else if (csv) {
                fileContent = csv;
            } else {
                return res.status(400).json({ error: 'Missing CSV content parameters or file upload stream.' });
            }

            if (!academicYearId || !subjectId) {
                return res.status(400).json({ error: 'academicYearId and subjectId are required parameters.' });
            }

            const results = await QuestionController.importService.importQuestionsFromCsv(
                schoolId,
                userId,
                academicYearId,
                subjectId,
                folderId || null,
                fileContent
            );

            return res.status(200).json(results);
        } catch (error: any) {
            console.error('[IMPORT QUESTIONS ERROR]', error);
            return res.status(500).json({ error: error.message || 'Failed to import CSV' });
        }
    }
}
