import { BaseService } from '../../../admission/services/BaseService';
import { supabase } from '../../../../config/supabase';

export class GPAHistoryService extends BaseService {
    public async recordTermGpa(
        academicRecordId: string,
        termId: string,
        gpa: number,
        earnedCredits: number,
        correlationId?: string
    ): Promise<any> {
        this.logInfo(`Recording term GPA metrics for academic record: ${academicRecordId}`, correlationId);

        const { data, error } = await supabase
            .from('student_academic_terms')
            .insert({
                academic_record_id: academicRecordId,
                term_id: termId,
                gpa,
                earned_credits: earnedCredits
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}
export default GPAHistoryService;
