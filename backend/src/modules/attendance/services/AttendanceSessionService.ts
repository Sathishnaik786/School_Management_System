import { BaseService } from '../../admission/services/BaseService';
import { AttendanceSessionRepository } from '../repositories/AttendanceSessionRepository';

export class AttendanceSessionService extends BaseService {
    private readonly repo = new AttendanceSessionRepository();

    public async createDailySession(
        schoolId: string,
        payload: any,
        correlationId?: string
    ): Promise<any> {
        this.logInfo(`Creating attendance session for date: ${payload.session_date}`, correlationId);

        return this.repo.createSession(schoolId, {
            campus_id: payload.campus_id,
            branch_id: payload.branch_id,
            academic_year_id: payload.academic_year_id,
            session_date: payload.session_date,
            timetable_slot_id: payload.timetable_slot_id
        });
    }
}
export default AttendanceSessionService;
