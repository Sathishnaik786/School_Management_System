import { BaseService } from '../../admission/services/BaseService';
import { AttendanceRecordRepository } from '../repositories/AttendanceRecordRepository';
import { AttendanceOutboxRepository } from '../repositories/AttendanceOutboxRepository';

export class AttendanceCaptureService extends BaseService {
    private readonly repo = new AttendanceRecordRepository();
    private readonly outboxRepo = new AttendanceOutboxRepository();

    public async captureStudentMark(
        payload: any,
        userId: string,
        correlationId?: string
    ): Promise<any> {
        this.logInfo(`Capturing student attendance mark: student=${payload.student_id}, status=${payload.status}`, correlationId);

        const record = await this.repo.markAttendance({
            session_id: payload.session_id,
            student_id: payload.student_id,
            status: payload.status,
            source: payload.source
        }, userId);

        // Queue outbox event
        await this.outboxRepo.queueEvent('AttendanceMarked', {
            record_id: record.id,
            session_id: record.session_id,
            student_id: record.student_id,
            status: record.status
        });

        return record;
    }
}
export default AttendanceCaptureService;
