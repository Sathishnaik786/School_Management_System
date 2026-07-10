import { supabase } from '../../../../config/supabase';
import { BaseRepository } from '../../../admission/repositories/BaseRepository';

export class BlueprintAnalyticsRepository extends BaseRepository<any> {
    constructor() {
        super('assessment_blueprints');
    }

    public async getBlueprintStats(schoolId: string): Promise<any[]> {
        const { data, error } = await supabase
            .from(this.tableName)
            .select('status, subject_id, total_marks')
            .eq('school_id', schoolId);

        if (error) throw error;
        return data || [];
    }
}
export default BlueprintAnalyticsRepository;
