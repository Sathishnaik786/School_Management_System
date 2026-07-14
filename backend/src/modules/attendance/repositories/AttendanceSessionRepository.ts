import { supabase } from '../../../config/supabase';
import { BaseRepository } from '../../admission/repositories/BaseRepository';

export class AttendanceSessionRepository extends BaseRepository<any> {
    constructor() {
        super('attendance_sessions');
    }

    public async createSession(schoolId: string, payload: any): Promise<any> {
        const { data, error } = await supabase
            .from(this.tableName)
            .insert({
                school_id: schoolId,
                campus_id: payload.campus_id,
                branch_id: payload.branch_id,
                academic_year_id: payload.academic_year_id,
                session_date: payload.session_date,
                timetable_slot_id: payload.timetable_slot_id,
                status: 'DRAFT'
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    public async updateStatus(sessionId: string, status: string): Promise<any> {
        const { data, error } = await supabase
            .from(this.tableName)
            .update({ status })
            .eq('id', sessionId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    public async listSessions(schoolId: string): Promise<any[]> {
        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('school_id', schoolId)
            .order('session_date', { ascending: false });

        if (error) throw error;
        return data || [];
    }
}
export default AttendanceSessionRepository;
