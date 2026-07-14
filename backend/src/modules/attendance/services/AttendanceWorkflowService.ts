import { BaseService } from '../../admission/services/BaseService';
import { AttendanceSessionRepository } from '../repositories/AttendanceSessionRepository';
import { supabase } from '../../../../config/supabase';

export class AttendanceWorkflowService extends BaseService {
    private readonly repo = new AttendanceSessionRepository();

    public async transitionSessionWorkflow(
        sessionId: string,
        decision: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED',
        userId: string,
        comments?: string,
        correlationId?: string
    ): Promise<any> {
        this.logInfo(`Transitioning attendance session workflow to: ${decision}`, correlationId);

        let targetStatus = 'DRAFT';
        if (decision === 'SUBMITTED') targetStatus = 'SUBMITTED';
        if (decision === 'APPROVED') targetStatus = 'APPROVED';

        const session = await this.repo.updateStatus(sessionId, targetStatus);

        // Save session locks if status is approved/locked
        if (targetStatus === 'APPROVED') {
            await this.repo.updateStatus(sessionId, 'LOCKED');
            await supabase
                .from('attendance_session_locks')
                .insert({
                    session_id: sessionId,
                    locked_by: userId,
                    reason: 'Workflow approval checklist complete.'
                });
        }

        // Insert workflow audit log
        await supabase
            .from('attendance_session_workflow')
            .insert({
                session_id: sessionId,
                approved_by: userId,
                role_level: 'HOD',
                decision,
                comments: comments || 'Workflow checklist check'
            });

        return session;
    }
}
export default AttendanceWorkflowService;
