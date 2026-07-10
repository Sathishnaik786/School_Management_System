import { supabase } from '../../../../config/supabase';
import { BaseRepository } from '../../../admission/repositories/BaseRepository';

export class AcademicRecordRepository extends BaseRepository<any> {
    constructor() {
        super('student_academic_records');
    }

    public async saveAcademicRecord(schoolId: string, payload: any): Promise<any> {
        // Upsert matching student_id
        const { data: existing } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('student_id', payload.student_id)
            .maybeSingle();

        if (existing) {
            const { data, error } = await supabase
                .from(this.tableName)
                .update({
                    cgpa: payload.cgpa,
                    total_credits: payload.total_credits,
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
                    school_id: schoolId,
                    student_id: payload.student_id,
                    cgpa: payload.cgpa,
                    total_credits: payload.total_credits
                })
                .select()
                .single();
            if (error) throw error;
            return data;
        }
    }

    public async logTimelineEvent(studentId: string, type: string, description: string): Promise<any> {
        const { data, error } = await supabase
            .from('student_academic_timeline')
            .insert({
                student_id: studentId,
                event_type: type,
                event_description: description
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}
export default AcademicRecordRepository;
