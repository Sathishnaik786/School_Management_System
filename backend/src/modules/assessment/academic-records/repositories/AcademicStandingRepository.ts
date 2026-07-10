import { supabase } from '../../../../config/supabase';
import { BaseRepository } from '../../../admission/repositories/BaseRepository';

export class AcademicStandingRepository extends BaseRepository<any> {
    constructor() {
        super('student_academic_standing');
    }

    public async saveStanding(studentId: string, standing: string): Promise<any> {
        const { data: existing } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('student_id', studentId)
            .maybeSingle();

        if (existing) {
            const { data, error } = await supabase
                .from(this.tableName)
                .update({
                    current_standing: standing,
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
                    current_standing: standing
                })
                .select()
                .single();
            if (error) throw error;
            return data;
        }
    }

    public async logWarning(studentId: string, reason: string): Promise<any> {
        const { data, error } = await supabase
            .from('student_warning_history')
            .insert({ student_id: studentId, reason })
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}
export default AcademicStandingRepository;
