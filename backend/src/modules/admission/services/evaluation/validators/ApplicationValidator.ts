import { ApplicationRepository } from '../../../repositories/application/ApplicationRepository';
import { NotFoundError } from '../../../errors/NotFoundError';
import { BusinessRuleError } from '../../../errors/BusinessRuleError';

export class ApplicationValidator {
    constructor(private readonly appRepo: ApplicationRepository) {}

    public async validate(applicationId: string): Promise<void> {
        const app = await this.appRepo.findById(applicationId);
        if (!app) {
            throw new NotFoundError(`Application with ID ${applicationId} not found`);
        }

        if (app.deletedAt) {
            throw new BusinessRuleError(`Application with ID ${applicationId} is soft-deleted`);
        }

        if (app.status !== 'SUBMITTED') {
            throw new BusinessRuleError(
                `Application must be in SUBMITTED status before entering the evaluation pipeline. Current status: ${app.status}`
            );
        }
    }
}
