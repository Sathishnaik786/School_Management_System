import { supabase } from '../../../../config/supabase';
import { BaseRepository } from '../../../admission/repositories/BaseRepository';

export class RevaluationRepository extends BaseRepository<any> {
    constructor() {
        super('assessment_revaluation_requests');
    }

    public async listRequests(schoolId: string): Promise<any[]> {
        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    public async createRequest(attemptId: string, studentId: string, reason: string): Promise<any> {
        const { data, error } = await supabase
            .from(this.tableName)
            .insert({
                attempt_id: attemptId,
                student_id: studentId,
                reason,
                status: 'REQUESTED'
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    public async updateStatus(requestId: string, status: string, remarks?: string): Promise<any> {
        const { data, error } = await supabase
            .from(this.tableName)
            .update({
                status,
                decision_remarks: remarks || null
            })
            .eq('id', requestId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}
export default RevaluationRepository;
