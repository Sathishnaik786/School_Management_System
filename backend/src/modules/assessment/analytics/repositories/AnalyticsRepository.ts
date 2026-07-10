import { supabase } from '../../../../config/supabase';
import { BaseRepository } from '../../../admission/repositories/BaseRepository';

export class AnalyticsRepository extends BaseRepository<any> {
    constructor() {
        super('assessment_analytics_snapshots');
    }

    public async saveSnapshot(schoolId: string, payload: any): Promise<any> {
        const { data, error } = await supabase
            .from(this.tableName)
            .insert({
                school_id: schoolId,
                snapshot_type: payload.snapshot_type,
                academic_year_id: payload.academic_year_id,
                payload: payload.payload
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    public async getSnapshots(schoolId: string, type?: string): Promise<any[]> {
        let query = supabase
            .from(this.tableName)
            .select('*')
            .eq('school_id', schoolId);

        if (type) {
            query = query.eq('snapshot_type', type);
        }

        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    }
}
export default AnalyticsRepository;
