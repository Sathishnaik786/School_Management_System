import { supabase } from '../../../../config/supabase';
import { BaseRepository } from '../../admission/repositories/BaseRepository';

export class AttendanceCalendarRepository extends BaseRepository<any> {
    constructor() {
        super('attendance_calendars');
    }

    public async createCalendar(schoolId: string, payload: any): Promise<any> {
        const { data, error } = await supabase
            .from(this.tableName)
            .insert({
                school_id: schoolId,
                campus_id: payload.campus_id,
                branch_id: payload.branch_id,
                academic_year_id: payload.academic_year_id,
                calendar_name: payload.calendar_name
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    public async setCalendarDay(calendarId: string, payload: any): Promise<any> {
        const { data, error } = await supabase
            .from('attendance_calendar_days')
            .insert({
                calendar_id: calendarId,
                day_date: payload.day_date,
                day_type: payload.day_type,
                remarks: payload.remarks || null
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}
export default AttendanceCalendarRepository;
