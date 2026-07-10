import { BaseService } from '../../../admission/services/BaseService';
import { PaperRepository } from '../repositories/PaperRepository';
import { PaperPublishingService } from './PaperPublishingService';
import { AuditService } from '../../../admission/services/AuditService';
import { EventBus } from '../../../../workflows/event-bus.service';
import { BusinessRuleError } from '../../../admission/errors/BusinessRuleError';

export class PaperWorkflowService extends BaseService {
    private readonly repo = new PaperRepository();
    private readonly publishingService = new PaperPublishingService();
    private readonly audit = new AuditService();

    public async transitionStatus(
        paperId: string,
        schoolId: string,
        userId: string,
        targetStatus: string,
        reason?: string,
        correlationId?: string
    ): Promise<any> {
        this.logInfo(`Transitioning generated paper: ${paperId} status to: ${targetStatus}`, correlationId);

        const paper = await this.repo.findPaperById(paperId, schoolId);
        if (!paper) throw new Error('Paper context not found.');

        const currentStatus = paper.status;

        // Verify valid transitions
        const allowedTransitions: Record<string, string[]> = {
            'DRAFT': ['GENERATED', 'CANCELLED'],
            'GENERATED': ['VALIDATED', 'CANCELLED'],
            'VALIDATED': ['APPROVED', 'CANCELLED'],
            'APPROVED': ['PUBLISHED', 'CANCELLED'],
            'PUBLISHED': ['ARCHIVED'],
            'ARCHIVED': ['DRAFT']
        };

        const allowed = allowedTransitions[currentStatus] || [];
        if (!allowed.includes(targetStatus)) {
            throw new BusinessRuleError(`Transition from "${currentStatus}" to "${targetStatus}" is not allowed.`);
        }

        const updated = await this.repo.updatePaper(paperId, schoolId, { status: targetStatus });

        // If targetStatus is PUBLISHED, generate the immutable aggregates snapshot
        if (targetStatus === 'PUBLISHED') {
            await this.publishingService.publishGeneratedPaper(paperId, schoolId, userId, correlationId);
            await EventBus.publish('PaperPublished', { paperId, schoolId, userId });
        } else {
            await EventBus.publish('PaperGenerated', { paperId, schoolId, userId });
        }

        await this.audit.logAudit({
            userId,
            action: 'ASSESSMENT_PAPER_WORKFLOW_TRANSITION',
            entityName: 'assessment_generated_papers',
            entityId: paperId,
            beforeState: { status: currentStatus },
            afterState: { status: targetStatus, reason },
            correlationId
        });

        return updated;
    }
}
export default PaperWorkflowService;
