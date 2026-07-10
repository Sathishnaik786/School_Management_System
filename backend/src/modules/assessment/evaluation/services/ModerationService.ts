import { BaseService } from '../../../admission/services/BaseService';
import { ModerationRepository } from '../repositories/ModerationRepository';
import { EvaluationRepository } from '../repositories/EvaluationRepository';

export class ModerationService extends BaseService {
    private readonly repo = new ModerationRepository();
    private readonly sessionRepo = new EvaluationRepository();

    public async checkVarianceAndQueue(
        sessionId: string,
        schoolId: string,
        firstMarks: number,
        secondMarks: number,
        correlationId?: string
    ): Promise<void> {
        this.logInfo(`Checking score variance for session: ${sessionId}`, correlationId);

        const difference = Math.abs(firstMarks - secondMarks);
        const maxMarks = 100.00;
        const variancePct = (difference / maxMarks) * 100.00;

        // If variance exceeds 15%, queue for Head Examiner moderation override check
        if (variancePct > 15.00) {
            await this.repo.queueForModeration(sessionId, firstMarks, secondMarks, variancePct);
            await this.sessionRepo.updateSessionStatus(sessionId, 'UNDER_MODERATION');
        } else {
            // Under threshold, auto-finalize marks
            await this.sessionRepo.updateSessionStatus(sessionId, 'FINALIZED');
        }
    }

    public async resolveModeration(
        queueId: string,
        moderatorId: string,
        moderatorMarks: number,
        status: 'RESOLVED' | 'REJECTED',
        correlationId?: string
    ): Promise<any> {
        this.logInfo(`Resolving moderation queue item: ${queueId}`, correlationId);

        const item = await this.repo.resolveModeration(queueId, moderatorId, moderatorMarks, status);
        
        if (status === 'RESOLVED') {
            await this.sessionRepo.updateSessionStatus(item.session_id, 'FINALIZED');
        }

        return item;
    }
}
export default ModerationService;
