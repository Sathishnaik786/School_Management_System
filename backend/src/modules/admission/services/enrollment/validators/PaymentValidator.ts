import { FeeRepository } from '../../../repositories/enrollment/FeeRepository';
import { BusinessRuleError } from '../../../errors/BusinessRuleError';

export class PaymentValidator {
    constructor(private readonly feeRepo: FeeRepository) {}

    public async validate(applicationId: string): Promise<void> {
        const assignments = await this.feeRepo.findAssignmentsByApplicationId(applicationId);
        
        let totalOutstanding = 0;
        for (const item of assignments) {
            totalOutstanding += item.outstandingAmount;
        }

        if (totalOutstanding > 0) {
            throw new BusinessRuleError(
                `Payment validation failed. Candidate outstanding fees balance is outstanding: ${totalOutstanding} INR.`
            );
        }
    }
}
