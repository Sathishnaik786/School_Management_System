import { LeadRepository } from '../../../repositories/crm/LeadRepository';
import { BusinessRuleError } from '../../../errors/BusinessRuleError';
import { NotFoundError } from '../../../errors/NotFoundError';

export class LeadValidator {
    constructor(private readonly leadRepo: LeadRepository) {}

    public async validate(leadId: string): Promise<void> {
        const lead = await this.leadRepo.findById(leadId);
        if (!lead) {
            throw new NotFoundError(`Lead with ID ${leadId} not found`);
        }
        if (lead.status !== 'INTERESTED') {
            throw new BusinessRuleError(
                `Lead status must be INTERESTED to create an application. Current status is: ${lead.status}`
            );
        }
    }
}
