import { BaseService } from '../../../admission/services/BaseService';
import { supabase } from '../../../../config/supabase';

export class DegreeAuditEngine extends BaseService {
    public async auditDegreeCompletion(
        studentId: string,
        programId: string,
        correlationId?: string
    ): Promise<any> {
        this.logInfo(`Running Degree requirements audit for student: ${studentId}`, correlationId);

        // Fetch student's record
        const { data: record } = await supabase
            .from('student_academic_records')
            .select('*')
            .eq('student_id', studentId)
            .maybeSingle();

        const completedCredits = record ? Number(record.total_credits) : 0;
        const cgpa = record ? Number(record.cgpa) : 0.00;

        // Fetch program requirements rules
        const { data: requirements } = await supabase
            .from('graduation_requirements')
            .select('*')
            .maybeSingle();

        const requiredCredits = requirements ? requirements.min_credits : 120;
        const requiredGpa = requirements ? Number(requirements.min_cgpa) : 6.00;

        const isGpaMet = cgpa >= requiredGpa;
        const isCreditsMet = completedCredits >= requiredCredits;
        const isEligible = isGpaMet && isCreditsMet;

        const { data: audit, error } = await supabase
            .from('graduation_audit')
            .insert({
                student_id: studentId,
                audit_status: isEligible ? 'ELIGIBLE' : 'INCOMPLETE',
                credits_completed: completedCredits,
                cgpa_score: cgpa
            })
            .select()
            .single();

        if (error) throw error;
        return audit;
    }
}
export default DegreeAuditEngine;
