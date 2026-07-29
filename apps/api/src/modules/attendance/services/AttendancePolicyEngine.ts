import { BaseService } from '../../admission/services/BaseService';
import { AttendancePolicyRepository } from '../repositories/AttendancePolicyRepository';

export class AttendancePolicyEngine extends BaseService {
    private readonly repo = new AttendancePolicyRepository();

    public async evaluatePolicyRules(
        schoolId: string,
        attendancePct: number,
        correlationId?: string
    ): Promise<boolean> {
        this.logInfo(`Running attendance policy verification checks against threshold rules`, correlationId);

        const policy = await this.repo.getPolicy(schoolId);
        const minAllowed = policy ? Number(policy.minimum_percentage) : 75.00;

        return attendancePct >= minAllowed;
    }
}
export default AttendancePolicyEngine;
