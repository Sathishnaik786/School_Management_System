import { supabase } from '../../../../config/supabase';
import { BaseRepository } from '../../../admission/repositories/BaseRepository';

export class SubjectStatisticsRepository extends BaseRepository<any> {
    constructor() {
        super('assessment_subject_statistics');
    }

    public async saveSubjectStats(payload: any): Promise<any> {
        const { data, error } = await supabase
            .from(this.tableName)
            .insert({
                subject_id: payload.subject_id,
                academic_year_id: payload.academic_year_id,
                pass_pct: payload.pass_pct,
                average_gpa: payload.average_gpa,
                enrolled_count: payload.enrolled_count,
                highest_score: payload.highest_score,
                lowest_score: payload.lowest_score
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}
export default SubjectStatisticsRepository;
