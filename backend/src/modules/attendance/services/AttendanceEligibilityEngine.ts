import { BaseService } from '../../admission/services/BaseService';
import { AttendanceEligibilityRepository } from '../repositories/AttendanceEligibilityRepository';
import { AttendancePolicyEngine } from './AttendancePolicyEngine';

export class AttendanceEligibilityEngine extends BaseService {
    private readonly repo = new AttendanceEligibilityRepository();
    private readonly policyEngine = new AttendancePolicyEngine();

    public async checkStudentEligibility(
        schoolId: string,
        studentId: string,
        subjectId: string,
        percentage: number,
        correlationId?: string
    ): Promise<any> {
        this.logInfo(`Verifying exam eligibility totals for student: ${studentId}`, correlationId);

        const isEligible = await this.policyEngine.evaluatePolicyRules(schoolId, percentage);
        
        return this.repo.saveEligibility(studentId, subjectId, percentage, isEligible);
    }
}
export default AttendanceEligibilityEngine;
