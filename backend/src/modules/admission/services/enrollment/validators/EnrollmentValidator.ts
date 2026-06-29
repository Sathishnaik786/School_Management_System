import { ApplicationRepository } from '../../../repositories/application/ApplicationRepository';
import { BusinessRuleError } from '../../../errors/BusinessRuleError';

export class EnrollmentValidator {
    constructor(private readonly appRepo: ApplicationRepository) {}

    public async validate(applicationId: string): Promise<void> {
        const app = await this.appRepo.findById(applicationId);
        if (!app) {
            throw new Error(`Application with ID ${applicationId} not found`);
        }

        if (app.deletedAt) {
            throw new BusinessRuleError('Application has been soft-deleted and cannot be enrolled');
        }

        if (app.status !== 'SUBMITTED') {
            throw new BusinessRuleError(`Application workflow status is ${app.status}. Must be SUBMITTED before enrollment.`);
        }
    }
}
