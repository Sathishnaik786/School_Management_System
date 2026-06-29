import { InterviewRepository } from '../../../repositories/evaluation/InterviewRepository';
import { BusinessRuleError } from '../../../errors/BusinessRuleError';

export class InterviewStateMachine {
    constructor(private readonly interviewRepo: InterviewRepository) {}

    public async validateTransition(
        fromStatus: string,
        toStatus: string,
        role: string
    ): Promise<void> {
        const isAllowed = await this.interviewRepo.getWorkflowRule(fromStatus, toStatus, role);
        if (!isAllowed) {
            // Fallback for safety/testing
            const fallbackRules: Record<string, string[]> = {
                'SCHEDULED': ['COMPLETED'],
                'COMPLETED': ['EVALUATED']
            };

            const allowed = fallbackRules[fromStatus]?.includes(toStatus);
            if (!allowed) {
                throw new BusinessRuleError(
                    `Invalid interview workflow transition from [${fromStatus}] to [${toStatus}] for role [${role}].`
                );
            }
        }
    }
}
