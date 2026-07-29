import { BaseService } from '../../../admission/services/BaseService';
import { GraduationRepository } from '../repositories/GraduationRepository';
import { GraduationEligibilityEngine } from './GraduationEligibilityEngine';
import { supabase } from '../../../../config/supabase';

export class GraduationWorkflowService extends BaseService {
    private readonly repo = new GraduationRepository();
    private readonly eligibilityEngine = new GraduationEligibilityEngine();

    public async transitionGraduation(
        studentId: string,
        targetStatus: 'ELIGIBLE' | 'UNDER_REVIEW' | 'CLEARANCE_PENDING' | 'APPROVED' | 'GRADUATED' | 'CERTIFICATE_GENERATED' | 'ARCHIVED',
        correlationId?: string
    ): Promise<any> {
        this.logInfo(`Transitioning graduation candidacy status for student: ${studentId} to: ${targetStatus}`, correlationId);

        if (targetStatus === 'APPROVED') {
            const isCleared = await this.eligibilityEngine.verifyClearances(studentId);
            if (!isCleared) {
                throw new Error('Candidacy cannot be approved. Clearance items NOCs remain pending.');
            }
        }

        const candidate = await this.repo.saveCandidate(studentId, targetStatus);

        // Timeline event logs
        await supabase
            .from('student_academic_timeline')
            .insert({
                student_id: studentId,
                event_type: 'GRADUATION_STATUS_CHANGE',
                event_description: `Graduation workflow transitioned to: ${targetStatus}`
            });

        return candidate;
    }
}
export default GraduationWorkflowService;
