import { BaseService } from '../../../admission/services/BaseService';
import { QuestionSearchRepository } from '../repositories/QuestionSearchRepository';
import { QuestionValidator } from '../validators/QuestionValidator';

export class QuestionSearchService extends BaseService {
    private readonly searchRepo = new QuestionSearchRepository();

    public async search(schoolId: string, queryParams: any, correlationId?: string): Promise<any> {
        this.logInfo(`Searching questions with filters for school: ${schoolId}`, correlationId);
        const filters = QuestionValidator.validateSearch(queryParams);
        return this.searchRepo.searchQuestions(schoolId, filters);
    }
}
export default QuestionSearchService;
