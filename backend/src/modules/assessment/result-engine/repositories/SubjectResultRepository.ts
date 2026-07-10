import { supabase } from '../../../../config/supabase';
import { BaseRepository } from '../../../admission/repositories/BaseRepository';

export class SubjectResultRepository extends BaseRepository<any> {
    constructor() {
        super('assessment_subject_results');
    }

    public async saveSubjectResult(studentResultId: string, payload: any): Promise<any> {
        const { data, error } = await supabase
            .from(this.tableName)
            .insert({
                student_result_id: studentResultId,
                subject_id: payload.subject_id,
                awarded_marks: payload.awarded_marks,
                maximum_marks: payload.maximum_marks,
                grade_label: payload.grade_label,
                grade_point: payload.grade_point
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}
export default SubjectResultRepository;
