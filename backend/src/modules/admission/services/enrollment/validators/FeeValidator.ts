import { FeeRepository } from '../../../repositories/enrollment/FeeRepository';
import { BusinessRuleError } from '../../../errors/BusinessRuleError';

export class FeeValidator {
    constructor(private readonly feeRepo: FeeRepository) {}

    public async validate(applicationId: string): Promise<void> {
        const assignments = await this.feeRepo.findAssignmentsByApplicationId(applicationId);
        if (!assignments || assignments.length === 0) {
            throw new BusinessRuleError('No fee structures components are currently assigned to this application.');
        }
    }
}
