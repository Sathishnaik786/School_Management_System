import { BaseService } from '../../../admission/services/BaseService';
import { RubricRepository } from '../repositories/RubricRepository';

export class RubricService extends BaseService {
    private readonly repo = new RubricRepository();

    public async createRubric(schoolId: string, payload: any, correlationId?: string): Promise<any> {
        this.logInfo(`Creating new Rubric scoring sheet for question: ${payload.question_snapshot_id}`, correlationId);
        return this.repo.createRubric(schoolId, payload);
    }

    public async listRubrics(schoolId: string, correlationId?: string): Promise<any[]> {
        this.logInfo(`Fetching rubrics list for school: ${schoolId}`, correlationId);
        return this.repo.listRubrics(schoolId);
    }
}
export default RubricService;
