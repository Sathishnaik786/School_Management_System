import { supabase } from '../../../../config/supabase';
import { BaseRepository } from '../../../admission/repositories/BaseRepository';

export class QuestionStatisticsRepository extends BaseRepository<any> {
    constructor() {
        super('assessment_question_statistics');
    }

    public async saveQuestionStats(payload: any): Promise<any> {
        const { data, error } = await supabase
            .from(this.tableName)
            .insert({
                question_snapshot_id: payload.question_snapshot_id,
                facility_value: payload.facility_value,
                difficulty_index: payload.difficulty_index,
                discrimination_index: payload.discrimination_index,
                skipped_pct: payload.skipped_pct,
                average_time_spent_seconds: payload.average_time_spent_seconds,
                median_marks: payload.median_marks,
                standard_deviation: payload.standard_deviation
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}
export default QuestionStatisticsRepository;
