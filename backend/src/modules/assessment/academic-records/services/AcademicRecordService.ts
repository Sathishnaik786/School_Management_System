import { BaseService } from '../../../admission/services/BaseService';
import { AcademicRecordRepository } from '../repositories/AcademicRecordRepository';
import { AcademicSnapshotService } from './AcademicSnapshotService';
import { supabase } from '../../../../config/supabase';

export class AcademicRecordService extends BaseService {
    private readonly repo = new AcademicRecordRepository();
    private readonly snapshotService = new AcademicSnapshotService();

    public async registerPublishedResult(
        schoolId: string,
        studentId: string,
        gpa: number,
        credits: number,
        correlationId?: string
    ): Promise<any> {
        this.logInfo(`Registering published result for student: ${studentId}`, correlationId);

        // Fetch current cumulative record totals
        const { data: current } = await supabase
            .from('student_academic_records')
            .select('*')
            .eq('student_id', studentId)
            .maybeSingle();

        const currentCredits = current ? Number(current.total_credits) : 0;
        const currentCgpa = current ? Number(current.cgpa) : 0.00;

        const newTotalCredits = currentCredits + credits;
        const newCgpa = newTotalCredits > 0 
            ? ((currentCgpa * currentCredits) + (gpa * credits)) / newTotalCredits
            : gpa;

        const record = await this.repo.saveAcademicRecord(schoolId, {
            student_id: studentId,
            cgpa: newCgpa,
            total_credits: newTotalCredits
        });

        // Log timeline event
        await this.repo.logTimelineEvent(
            studentId,
            'GPA_UPDATED',
            `Academic CGPA updated to ${newCgpa.toFixed(2)} with total earned credits: ${newTotalCredits}`
        );

        // Save immutable snapshot backup
        await this.snapshotService.captureSnapshot(record.id, record);

        return record;
    }
}
export default AcademicRecordService;
