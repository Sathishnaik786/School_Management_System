import { BaseService } from '../../../admission/services/BaseService';
import { AcademicStandingRepository } from '../repositories/AcademicStandingRepository';
import { supabase } from '../../../../config/supabase';

export class AcademicStandingEngine extends BaseService {
    private readonly repo = new AcademicStandingRepository();

    public async evaluateStanding(
        schoolId: string,
        studentId: string,
        cgpa: number,
        backlogsCount: number,
        correlationId?: string
    ): Promise<any> {
        this.logInfo(`Running academic standing checks for student: ${studentId}`, correlationId);

        // Fetch standing rules parameters
        const { data: rules } = await supabase
            .from('academic_standing_rules')
            .select('*')
            .eq('school_id', schoolId);

        let targetStanding: 'GOOD_STANDING' | 'WARNING' | 'PROBATION' | 'SUSPENSION' | 'HONORS' = 'GOOD_STANDING';

        // Check rule ranges (simulate checks)
        if (cgpa >= 9.00) {
            targetStanding = 'HONORS';
        } else if (backlogsCount > 2 || cgpa < 5.00) {
            targetStanding = 'PROBATION';
        } else if (cgpa < 6.00) {
            targetStanding = 'WARNING';
        }

        const standingRecord = await this.repo.saveStanding(studentId, targetStanding);

        if (targetStanding === 'PROBATION') {
            await this.repo.logWarning(studentId, 'Placed on academic probation due to GPA dropping below threshold.');
            await supabase
                .from('student_probation_history')
                .insert({ student_id: studentId, reason: 'Low CGPA warning' });
        } else if (targetStanding === 'HONORS') {
            await supabase
                .from('student_honors_history')
                .insert({ student_id: studentId, honor_title: 'Dean Honors Roll List' });
        }

        return standingRecord;
    }
}
export default AcademicStandingEngine;
