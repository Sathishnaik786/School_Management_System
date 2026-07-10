import { supabase } from '../../../../config/supabase';
import { BaseRepository } from '../../../admission/repositories/BaseRepository';

export class ResultRepository extends BaseRepository<any> {
    constructor() {
        super('assessment_result_sessions');
    }

    public async listSessions(schoolId: string): Promise<any[]> {
        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('school_id', schoolId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    public async findSessionById(sessionId: string, schoolId: string): Promise<any | null> {
        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('id', sessionId)
            .eq('school_id', schoolId)
            .maybeSingle();

        if (error) throw error;
        return data;
    }

    public async createSession(schoolId: string, payload: any, userId?: string): Promise<any> {
        const { data, error } = await supabase
            .from(this.tableName)
            .insert({
                school_id: schoolId,
                academic_year_id: payload.academic_year_id,
                term_id: payload.term_id,
                status: 'DRAFT',
                created_by: userId
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    public async updateStatus(sessionId: string, status: string): Promise<any> {
        const { data, error } = await supabase
            .from(this.tableName)
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', sessionId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}
export default ResultRepository;
