import { Request, Response } from 'express';
import { QuestionSearchService } from '../services/QuestionSearchService';

export class SearchController {
    private static searchService = new QuestionSearchService();

    public static async searchQuestions(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            if (!schoolId) return res.status(400).json({ error: 'School context could not be resolved.' });

            // Normalize numeric queries
            const queryParams = {
                ...req.query,
                page: req.query.page ? parseInt(String(req.query.page), 10) : 1,
                limit: req.query.limit ? parseInt(String(req.query.limit), 10) : 10
            };

            const result = await SearchController.searchService.search(schoolId, queryParams);
            return res.status(200).json(result);
        } catch (error: any) {
            return res.status(error.status || 400).json({ error: error.message || 'Failed to perform search' });
        }
    }
}
export default SearchController;
