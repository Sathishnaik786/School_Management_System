import { ApplicationRepository } from '../../../repositories/application/ApplicationRepository';
import { BusinessRuleError } from '../../../errors/BusinessRuleError';

export class ApplicationStateMachine {
    constructor(private readonly appRepo: ApplicationRepository) {}

    /**
     * Checks if a status transition is permitted for a specific role.
     */
    public async validateTransition(
        fromStatus: string,
        toStatus: string,
        role: string
    ): Promise<void> {
        // Enforce state transitions rules dynamically from database
        const isAllowed = await this.appRepo.getWorkflowRule(fromStatus, toStatus, role);
        
        if (!isAllowed) {
            // Static fallback for safety/testing
            const fallbackRules: Record<string, string[]> = {
                'DRAFT': ['IN_PROGRESS'],
                'IN_PROGRESS': ['UNDER_REVIEW', 'SUBMITTED'],
                'UNDER_REVIEW': ['CORRECTION_REQUIRED'],
                'CORRECTION_REQUIRED': ['IN_PROGRESS']
            };

            const allowed = fallbackRules[fromStatus]?.includes(toStatus);
            if (!allowed) {
                throw new BusinessRuleError(
                    `Invalid workflow transition from [${fromStatus}] to [${toStatus}] for role [${role}].`
                );
            }
        }
    }
}
