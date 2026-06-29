import { StudentProvisionRepository } from '../../../repositories/enrollment/StudentProvisionRepository';
import { BusinessRuleError } from '../../../errors/BusinessRuleError';

export class StudentProvisionValidator {
    constructor(private readonly provisionRepo: StudentProvisionRepository) {}

    public async validate(applicationId: string): Promise<void> {
        const jobs = await this.provisionRepo.findJobsByApplicationId(applicationId);
        const steps = ['Student', 'Academic', 'Parent', 'User', 'Transport', 'Hostel', 'Library', 'IDCard'];

        for (const step of steps) {
            const job = jobs.find(j => j.stepName === step);
            if (!job) {
                throw new BusinessRuleError(`ERP Provisioning step "${step}" job has not been executed.`);
            }
            if (job.status !== 'COMPLETED') {
                throw new BusinessRuleError(
                    `ERP Provisioning step "${step}" status is currently "${job.status}". Must be COMPLETED. Error: ${job.errorMessage || 'None'}`
                );
            }
        }
    }
}
