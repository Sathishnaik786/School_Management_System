import { supabase } from '../../../config/supabase';
import { BaseRepository } from '../../admission/repositories/BaseRepository';

export class AttendanceRecordRepository extends BaseRepository<any> {
    constructor() {
        super('attendance_records');
    }

    public async markAttendance(payload: any, userId?: string): Promise<any> {
        const { data: existing } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('session_id', payload.session_id)
            .eq('student_id', payload.student_id)
            .maybeSingle();

        if (existing) {
            // Save audit snapshot to version history
            await supabase
                .from('attendance_record_versions')
                .insert({
                    attendance_record_id: existing.id,
                    previous_snapshot: existing,
                    changed_by: userId,
                    changed_reason: 'Attendance corrected post validation checks'
                });

            const { data, error } = await supabase
                .from(this.tableName)
                .update({
                    status: payload.status,
                    source: payload.source,
                    marked_by: userId,
                    marked_at: new Date()
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
                    session_id: payload.session_id,
                    student_id: payload.student_id,
                    status: payload.status,
                    source: payload.source,
                    marked_by: userId
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        }
    }

    public async getRecordsBySession(sessionId: string): Promise<any[]> {
        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('session_id', sessionId);

        if (error) throw error;
        return data || [];
    }
}
export default AttendanceRecordRepository;
