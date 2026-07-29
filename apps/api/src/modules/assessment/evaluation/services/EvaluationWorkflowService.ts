import { BaseService } from '../../../admission/services/BaseService';
import { EvaluationRepository } from '../repositories/EvaluationRepository';
import { EventBus } from '../../../../workflows/event-bus.service';
import { supabase } from '../../../../config/supabase';

export class EvaluationWorkflowService extends BaseService {
    private readonly repo = new EvaluationRepository();

    public async transitionSessionWorkflow(
        sessionId: string,
        schoolId: string,
        userId: string,
        targetStatus: string,
        correlationId?: string
    ): Promise<any> {
        this.logInfo(`Transitioning session: ${sessionId} status to: ${targetStatus}`, correlationId);

        const session = await this.repo.findSessionById(sessionId, schoolId);
        if (!session) throw new Error('Session not found.');

        // Allowable state mappings transitions
        const allowedTransitions: Record<string, string[]> = {
            'DRAFT': ['AUTO_GRADED', 'UNDER_EVALUATION', 'LOCKED'],
            'AUTO_GRADED': ['UNDER_EVALUATION', 'UNDER_MODERATION', 'FINALIZED'],
            'UNDER_EVALUATION': ['UNDER_MODERATION', 'FINALIZED'],
            'UNDER_MODERATION': ['FINALIZED', 'RE_EVALUATION'],
            'RE_EVALUATION': ['FINALIZED'],
            'FINALIZED': ['PUBLISHED', 'LOCKED'],
            'PUBLISHED': ['LOCKED'],
            'LOCKED': []
        };

        const currentStatus = session.status;
        const allowed = allowedTransitions[currentStatus] || [];
        
        if (!allowed.includes(targetStatus) && targetStatus !== 'LOCKED') {
            throw new Error(`Invalid status transition from: "${currentStatus}" to: "${targetStatus}"`);
        }

        const updated = await this.repo.updateSessionStatus(sessionId, targetStatus);

        // Publish events
        if (targetStatus === 'LOCKED') {
            await EventBus.publish('EvaluationLocked', { sessionId, schoolId, userId });
        } else if (targetStatus === 'PUBLISHED') {
            await EventBus.publish('EvaluationPublished', { sessionId, schoolId, userId });
        }

        // Release lock
        await supabase
            .from('assessment_evaluation_locks')
            .delete()
            .eq('evaluation_session_id', sessionId);

        return updated;
    }
}
export default EvaluationWorkflowService;
