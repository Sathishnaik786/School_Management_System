import { BaseService } from '../../../admission/services/BaseService';
import { RevaluationRepository } from '../repositories/RevaluationRepository';

export class RevaluationService extends BaseService {
    private readonly repo = new RevaluationRepository();

    public async applyForRevaluation(
        attemptId: string,
        studentId: string,
        reason: string,
        correlationId?: string
    ): Promise<any> {
        this.logInfo(`Initiating revaluation request for attempt: ${attemptId}`, correlationId);
        return this.repo.createRequest(attemptId, studentId, reason);
    }

    public async approveRevaluation(
        requestId: string,
        remarks: string,
        correlationId?: string
    ): Promise<any> {
        this.logInfo(`Approving revaluation request: ${requestId}`, correlationId);
        return this.repo.updateStatus(requestId, 'APPROVED', remarks);
    }
}
export default RevaluationService;
