import { supabase } from '../../../config/supabase';
import { BaseRepository } from '../../admission/repositories/BaseRepository';

export class AttendanceEligibilityRepository extends BaseRepository<any> {
    constructor() {
        super('attendance_eligibility');
    }

    public async saveEligibility(studentId: string, subjectId: string, percentage: number, isEligible: boolean): Promise<any> {
        const { data: existing } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('student_id', studentId)
            .eq('subject_id', subjectId)
            .maybeSingle();

        if (existing) {
            const { data, error } = await supabase
                .from(this.tableName)
                .update({
                    attendance_percentage: percentage,
                    is_eligible: isEligible,
                    updated_at: new Date()
                })
                .eq('id', existing.id)
                .select()
                .single();
            if (error) throw error;
            return data;
        } else {
            const { data, error } = await supabase
                .from(this.tableName)
                .insert({
                    student_id: studentId,
                    subject_id: subjectId,
                    attendance_percentage: percentage,
                    is_eligible: isEligible
                })
                .select()
                .single();
            if (error) throw error;
            return data;
        }
    }
}
export default AttendanceEligibilityRepository;
