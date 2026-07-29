import { supabase } from '../../../../config/supabase';
import { BaseRepository } from '../../../admission/repositories/BaseRepository';

export class SemesterResultRepository extends BaseRepository<any> {
    constructor() {
        super('assessment_semester_results');
    }

    public async saveSemesterSummary(studentId: string, semesterLabel: string, gpa: number, credits: number): Promise<any> {
        const { data, error } = await supabase
            .from(this.tableName)
            .insert({
                student_id: studentId,
                semester_label: semesterLabel,
                gpa,
                earned_credits: credits
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}
export default SemesterResultRepository;
