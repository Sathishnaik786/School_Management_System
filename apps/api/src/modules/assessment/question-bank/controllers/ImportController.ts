import { Request, Response } from 'express';
import { ImportExportService } from '../services/import-export.service';
import { QuestionValidator } from '../validators/QuestionValidator';

export class ImportController {
    private static importService = new ImportExportService();

    public static async importCsv(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            if (!schoolId || !userId) return res.status(400).json({ error: 'Context credentials could not be resolved.' });

            // Validate inputs
            const validated = QuestionValidator.validateImport(req.body);

            const result = await ImportController.importService.importQuestionsFromCsv(
                schoolId,
                userId,
                validated.academicYearId,
                validated.subjectId,
                validated.folderId || null,
                validated.csv
            );

            return res.status(200).json(result);
        } catch (error: any) {
            return res.status(error.status || 400).json({ error: error.message || 'Failed to import CSV dataset.' });
        }
    }
}
export default ImportController;
