import { BaseService } from '../../admission/services/BaseService';
import { supabase } from '../../../../config/supabase';

export class AttendanceNotificationService extends BaseService {
    public async triggerShortageNotification(
        studentId: string,
        currentPercentage: number,
        correlationId?: string
    ): Promise<any> {
        this.logInfo(`Enqueuing warning notifications shortage alert for student: ${studentId}`, correlationId);

        const { data, error } = await supabase
            .from('attendance_event_outbox')
            .insert({
                event_name: 'AttendanceShortageDetected',
                payload: {
                    student_id: studentId,
                    percentage: currentPercentage,
                    message: `Warning: Attendance falls to ${currentPercentage.toFixed(2)}% below the 75% threshold.`
                }
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}
export default AttendanceNotificationService;
