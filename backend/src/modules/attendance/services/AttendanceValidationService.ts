import { BaseService } from '../../admission/services/BaseService';
import { supabase } from '../../../../config/supabase';

export class AttendanceValidationService extends BaseService {
    public async validateMarking(
        studentId: string,
        sessionDate: string,
        correlationId?: string
    ): Promise<void> {
        this.logInfo(`Validating attendance marking credentials for student: ${studentId}`, correlationId);

        // Check for approved leave overlaps
        const { data: leaves } = await supabase
            .from('student_leave_requests')
            .select('*')
            .eq('student_id', studentId)
            .eq('status', 'APPROVED');

        for (const leave of leaves || []) {
            const start = new Date(leave.start_date);
            const end = new Date(leave.end_date);
            const current = new Date(sessionDate);

            if (current >= start && current <= end) {
                throw new Error('Attendance marking failed. Student has an approved leave overlap for this date.');
            }
        }
    }
}
export default AttendanceValidationService;
