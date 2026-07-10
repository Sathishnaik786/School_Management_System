import { supabase } from '../../../../config/supabase';
import { BaseRepository } from '../../../admission/repositories/BaseRepository';

export class StudentResultRepository extends BaseRepository<any> {
    constructor() {
        super('assessment_student_results');
    }

    public async listResultsBySession(sessionId: string): Promise<any[]> {
        const { data, error } = await supabase
            .from(this.tableName)
            .select('*, subject_results:assessment_subject_results(*)')
            .eq('session_id', sessionId);

        if (error) throw error;
        return data || [];
    }

    public async saveStudentResult(payload: any): Promise<any> {
        const { data, error } = await supabase
            .from(this.tableName)
            .insert({
                session_id: payload.session_id,
                student_id: payload.student_id,
                raw_marks_sum: payload.raw_marks_sum,
                scaled_marks_sum: payload.scaled_marks_sum,
                grace_marks_sum: payload.grace_marks_sum,
                final_percentage: payload.final_percentage,
                gpa: payload.gpa,
                cgpa: payload.cgpa,
                total_credits: payload.total_credits
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}
export default StudentResultRepository;
