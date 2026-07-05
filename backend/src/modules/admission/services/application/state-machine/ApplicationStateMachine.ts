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
            // Static fallback for safety/testing enforcing Phase 2 transition matrices
            const fallbackRules: Record<string, string[]> = {
                'DRAFT': ['SUBMITTED', 'IN_PROGRESS', 'DOCS_PENDING'],
                'IN_PROGRESS': ['UNDER_REVIEW', 'SUBMITTED', 'DOCS_PENDING'],
                'SUBMITTED': ['UNDER_REVIEW', 'DOCS_PENDING'],
                'UNDER_REVIEW': ['DOCS_PENDING', 'DOCUMENT_VERIFIED', 'CORRECTION_REQUIRED', 'OFFERED'],
                'CORRECTION_REQUIRED': ['IN_PROGRESS', 'DOCS_PENDING'],
                'DOCS_PENDING': ['UNDER_REVIEW', 'SUBMITTED', 'DOCUMENT_VERIFIED'],
                'DOCUMENT_VERIFIED': ['INTERVIEW', 'EXAM'],
                'INTERVIEW': ['EXAM', 'MERIT', 'FEE_PENDING'],
                'EXAM': ['MERIT', 'FEE_PENDING', 'UNDER_REVIEW'],
                'MERIT': ['OFFERED', 'FEE_PENDING', 'UNDER_REVIEW'],
                'OFFERED': ['FEE_PENDING', 'FEE_VERIFIED'],
                'FEE_PENDING': ['FEE_VERIFIED', 'UNDER_REVIEW'],
                'FEE_VERIFIED': ['ENROLLED', 'OFFERED'],
                'ENROLLED': []
            };

            const allowed = fallbackRules[fromStatus]?.includes(toStatus);
            if (!allowed) {
                throw new BusinessRuleError(
                    `Invalid workflow transition from [${fromStatus}] to [${toStatus}] for role [${role}].`
                );
            }

            // Role-based Transition Restrictor (Except for ADMIN bypass)
            const normalizedRole = role.toUpperCase();
            if (normalizedRole === 'WORKFLOW_ORCHESTRATOR') {
                return;
            }
            if (normalizedRole !== 'ADMIN') {
                if (['DRAFT', 'DOCS_PENDING'].includes(fromStatus) && toStatus === 'SUBMITTED') {
                    if (normalizedRole !== 'PARENT' && normalizedRole !== 'COUNSELOR') {
                        throw new BusinessRuleError(`Forbidden: Only Parent or Counselor can submit applications.`);
                    }
                }
                if (toStatus === 'DOCUMENT_VERIFIED' || toStatus === 'DOCS_PENDING') {
                    if (normalizedRole !== 'ADMISSION_OFFICER') {
                        throw new BusinessRuleError(`Forbidden: Only Admission Officer can verify or request documents.`);
                    }
                }
                if (['EXAM', 'INTERVIEW', 'MERIT'].includes(toStatus)) {
                    if (normalizedRole !== 'EXAM_CELL' && normalizedRole !== 'EXAM_CELL_ADMIN') {
                        throw new BusinessRuleError(`Forbidden: Only Exam Cell can manage exam, interview or merit list states.`);
                    }
                }
                if (toStatus === 'OFFERED') {
                    if (normalizedRole !== 'PRINCIPAL' && normalizedRole !== 'HOI' && normalizedRole !== 'HEAD_OF_INSTITUTE') {
                        throw new BusinessRuleError(`Forbidden: Only Principal / HOI can approve offers.`);
                    }
                }
                if (toStatus === 'FEE_VERIFIED') {
                    if (normalizedRole !== 'FINANCE_OFFICER' && normalizedRole !== 'ACCOUNTANT') {
                        throw new BusinessRuleError(`Forbidden: Only Finance Officer can verify payments.`);
                    }
                }
                if (toStatus === 'ENROLLED') {
                    if (normalizedRole !== 'ADMISSION_OFFICER') {
                        throw new BusinessRuleError(`Forbidden: Only Admission Officer can confirm final enrollment.`);
                    }
                }
            }
        }
    }
}
