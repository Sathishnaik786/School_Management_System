import { supabase } from '../../../../config/supabase';
import { BaseRepository } from '../../../admission/repositories/BaseRepository';

export class GradeCardRepository extends BaseRepository<any> {
    constructor() {
        super('assessment_grade_cards');
    }

    public async createGradeCard(studentResultId: string, issueNumber: string, userId?: string): Promise<any> {
        const { data, error } = await supabase
            .from(this.tableName)
            .insert({
                student_result_id: studentResultId,
                issue_number: issueNumber,
                issued_by: userId
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}
export default GradeCardRepository;
