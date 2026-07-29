import { supabase } from '../../../../config/supabase';
import { BaseRepository } from '../../../admission/repositories/BaseRepository';

export class ModerationRepository extends BaseRepository<any> {
    constructor() {
        super('assessment_moderation_queue');
    }

    public async getQueue(schoolId: string): Promise<any[]> {
        const { data, error } = await supabase
            .from(this.tableName)
            .select('*, session:assessment_evaluation_sessions(*)')
            .eq('session.school_id', schoolId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    public async queueForModeration(
        sessionId: string,
        firstMarks: number,
        secondMarks: number,
        variance: number
    ): Promise<any> {
        const { data, error } = await supabase
            .from(this.tableName)
            .insert({
                session_id: sessionId,
                first_evaluator_marks: firstMarks,
                second_evaluator_marks: secondMarks,
                variance_pct: variance,
                status: 'PENDING'
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    public async resolveModeration(
        queueId: string,
        moderatorId: string,
        moderatorMarks: number,
        status: 'RESOLVED' | 'REJECTED'
    ): Promise<any> {
        const { data, error } = await supabase
            .from(this.tableName)
            .update({
                moderator_id: moderatorId,
                moderator_marks: moderatorMarks,
                status
            })
            .eq('id', queueId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}
export default ModerationRepository;
