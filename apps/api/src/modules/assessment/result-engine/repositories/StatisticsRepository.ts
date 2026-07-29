import { supabase } from '../../../../config/supabase';
import { BaseRepository } from '../../../admission/repositories/BaseRepository';

export class StatisticsRepository extends BaseRepository<any> {
    constructor() {
        super('assessment_result_statistics');
    }

    public async saveStatistics(sessionId: string, payload: any): Promise<any> {
        const { error: delError } = await supabase
            .from(this.tableName)
            .delete()
            .eq('session_id', sessionId);

        if (delError) throw delError;

        const { data, error } = await supabase
            .from(this.tableName)
            .insert({
                session_id: sessionId,
                pass_pct: payload.pass_pct,
                fail_pct: payload.fail_pct,
                average_gpa: payload.average_gpa,
                median_gpa: payload.median_gpa,
                standard_deviation: payload.standard_deviation,
                distinction_count: payload.distinction_count,
                first_class_count: payload.first_class_count
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}
export default StatisticsRepository;
