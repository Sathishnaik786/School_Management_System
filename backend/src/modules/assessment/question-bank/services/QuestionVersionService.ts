import { BaseService } from '../../../admission/services/BaseService';
import { QuestionVersionRepository } from '../repositories/QuestionVersionRepository';
import { AuditService } from '../../../admission/services/AuditService';
import { EventBus } from '../../../../workflows/event-bus.service';

export class QuestionVersionService extends BaseService {
    private readonly versionRepo = new QuestionVersionRepository();
    private readonly audit = new AuditService();

    public async getVersionsHistory(questionId: string, schoolId: string, correlationId?: string): Promise<any[]> {
        this.logInfo(`Fetching version history timeline for question: ${questionId}`, correlationId);
        return this.versionRepo.findVersions(questionId, schoolId);
    }

    public async restoreVersion(questionId: string, versionNumber: number, schoolId: string, userId: string, correlationId?: string): Promise<any> {
        this.logInfo(`Restoring question: ${questionId} to past version: ${versionNumber}`, correlationId);
        const restored = await this.versionRepo.restoreVersion(questionId, versionNumber, schoolId, userId);

        await this.audit.logAudit({
            userId,
            action: 'ASSESSMENT_QUESTION_RESTORE',
            entityName: 'assessment_question_bank',
            entityId: questionId,
            afterState: restored,
            correlationId
        });

        await EventBus.publish('QuestionVersionCreated', { questionId, version: restored.version, schoolId, userId });
        return restored;
    }
}
export default QuestionVersionService;
