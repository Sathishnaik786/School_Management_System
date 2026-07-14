import { BaseService } from '../../admission/services/BaseService';
import { supabase } from '../../../../config/supabase';

export class AttendanceStatisticsService extends BaseService {
    public async calculateRosterPercentages(
        studentId: string,
        correlationId?: string
    ): Promise<any> {
        this.logInfo(`Running roll-up attendance metrics for student: ${studentId}`, correlationId);

        // Fetch records
        const { data: records, error } = await supabase
            .from('attendance_records')
            .select('*')
            .eq('student_id', studentId);

        if (error) throw error;

        let totalSessions = records?.length || 0;
        let presentSessions = 0;

        for (const rec of records || []) {
            if (rec.status === 'PRESENT' || rec.status === 'LATE' || rec.status === 'ONLINE' || rec.status === 'HYBRID') {
                presentSessions++;
            }
        }

        const percentage = totalSessions > 0 ? (presentSessions / totalSessions) * 100.00 : 100.00;

        const { data: stats, error: statsError } = await supabase
            .from('student_attendance_statistics')
            .insert({
                student_id: studentId,
                overall_percentage: percentage
            })
            .select()
            .single();

        if (statsError) throw statsError;
        return stats;
    }
}
export default AttendanceStatisticsService;
