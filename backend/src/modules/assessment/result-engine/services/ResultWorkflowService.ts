import { BaseService } from '../../../admission/services/BaseService';
import { ResultRepository } from '../repositories/ResultRepository';
import { EventBus } from '../../../../workflows/event-bus.service';
import { supabase } from '../../../../config/supabase';

export class ResultWorkflowService extends BaseService {
    private readonly repo = new ResultRepository();

    public async transitionWorkflow(
        sessionId: string,
        schoolId: string,
        userId: string,
        targetStatus: string,
        comments?: string,
        correlationId?: string
    ): Promise<any> {
        this.logInfo(`Transitioning result session: ${sessionId} to status: ${targetStatus}`, correlationId);

        const session = await this.repo.findSessionById(sessionId, schoolId);
        if (!session) throw new Error('Result session context not found.');

        const currentStatus = session.status;
        
        const allowedTransitions: Record<string, string[]> = {
            'DRAFT': ['CALCULATED'],
            'CALCULATED': ['UNDER_VERIFICATION'],
            'UNDER_VERIFICATION': ['APPROVED', 'DRAFT'],
            'APPROVED': ['PUBLISHED', 'LOCKED'],
            'PUBLISHED': ['LOCKED'],
            'LOCKED': []
        };

        const allowed = allowedTransitions[currentStatus] || [];
        if (!allowed.includes(targetStatus) && targetStatus !== 'LOCKED') {
            throw new Error(`Invalid status transition from "${currentStatus}" to "${targetStatus}"`);
        }

        const updated = await this.repo.updateStatus(sessionId, targetStatus);

        // Audit workflow logs mapping
        await supabase
            .from('assessment_result_approval_workflow')
            .insert({
                session_id: sessionId,
                approved_by: userId,
                role_level: 'APPROVER',
                decision: targetStatus === 'APPROVED' ? 'APPROVED' : 'PENDING',
                comments: comments || 'Workflow checklist transition'
            });

        // Publish events
        if (targetStatus === 'LOCKED') {
            await EventBus.publish('ResultLocked', { sessionId, schoolId, userId });
        } else if (targetStatus === 'APPROVED') {
            await EventBus.publish('ResultApproved', { sessionId, schoolId, userId });
        }

        return updated;
    }
}
export default ResultWorkflowService;
