import { supabase } from '../../../../config/supabase';
import { BaseRepository } from '../../../admission/repositories/BaseRepository';

export class GradeCalculationRepository extends BaseRepository<any> {
    constructor() {
        super('assessment_grade_calculations');
    }

    public async findByAttemptId(attemptId: string, schoolId: string): Promise<any | null> {
        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('attempt_id', attemptId)
            .eq('school_id', schoolId)
            .maybeSingle();

        if (error) throw error;
        return data;
    }

    public async saveCalculation(schoolId: string, payload: any, userId?: string): Promise<any> {
        const { data: existing } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('attempt_id', payload.attempt_id)
            .eq('school_id', schoolId)
            .maybeSingle();

        let result;
        if (existing) {
            const { data, error } = await supabase
                .from(this.tableName)
                .update({
                    raw_marks: payload.raw_marks,
                    scaled_marks: payload.scaled_marks,
                    grace_marks: payload.grace_marks,
                    final_marks: payload.final_marks,
                    grade_label: payload.grade_label,
                    grade_point: payload.grade_point,
                    credits: payload.credits,
                    calculated_at: new Date().toISOString()
                })
                .eq('id', existing.id)
                .select()
                .single();

            if (error) throw error;
            result = data;

            // Save history
            await supabase
                .from('assessment_grade_history')
                .insert({
                    calculation_id: result.id,
                    raw_marks: existing.raw_marks,
                    final_marks: result.final_marks,
                    grade_label: result.grade_label,
                    changed_by: userId,
                    change_reason: 'Recalculation grade update session log'
                });
        } else {
            const { data, error } = await supabase
                .from(this.tableName)
                .insert({
                    ...payload,
                    school_id: schoolId
                })
                .select()
                .single();

            if (error) throw error;
            result = data;
        }

        return result;
    }
}
export default GradeCalculationRepository;
