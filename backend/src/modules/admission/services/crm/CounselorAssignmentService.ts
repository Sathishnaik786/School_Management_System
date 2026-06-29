import { BaseService } from '../BaseService';
import { LeadRepository } from '../../repositories/crm/LeadRepository';
import { AdmissionLead } from '../../domain/AdmissionLead';
import { AssignmentStrategy } from './assignment/AssignmentStrategy';
import { ManualAssignmentStrategy } from './assignment/ManualAssignmentStrategy';
import { RoundRobinAssignmentStrategy } from './assignment/RoundRobinAssignmentStrategy';
import { AuditService } from '../AuditService';
import { ConflictError } from '../../errors/ConflictError';
import { NotFoundError } from '../../errors/NotFoundError';

export class CounselorAssignmentService extends BaseService {
    constructor(
        private readonly leadRepo: LeadRepository,
        private readonly auditService: AuditService
    ) {
        super();
    }

    /**
     * Assigns a counselor to a lead using the specified strategy.
     */
    public async assignCounselor(
        leadId: string,
        strategyType: 'manual' | 'round_robin',
        strategyParams: { counselorId?: string; updatedAt: string },
        correlationId?: string
    ): Promise<AdmissionLead> {
        const lead = await this.leadRepo.findById(leadId);
        if (!lead) {
            throw new NotFoundError(`Lead with ID ${leadId} not found`);
        }

        const beforeState = { ...lead };

        // Validate optimistic locking
        const expectedUpdatedAt = new Date(strategyParams.updatedAt);
        const actualUpdatedAt = new Date(lead.updatedAt);
        if (actualUpdatedAt.getTime() !== expectedUpdatedAt.getTime()) {
            throw new ConflictError('Concurrent modification detected. Please refresh.');
        }

        // Instantiate Strategy
        let strategy: AssignmentStrategy;
        if (strategyType === 'manual') {
            if (!strategyParams.counselorId) {
                throw new Error('Counselor ID must be provided for manual assignment');
            }
            strategy = new ManualAssignmentStrategy(strategyParams.counselorId);
        } else {
            strategy = new RoundRobinAssignmentStrategy();
        }

        const counselorId = await strategy.assign(lead);

        // Update Lead Domain Model
        const updated = new AdmissionLead(
            lead.id,
            lead.enquiryId,
            counselorId,
            lead.status,
            lead.lostReason,
            lead.createdAt,
            new Date(),
            lead.deletedAt
        );

        let saved: AdmissionLead;
        try {
            saved = await this.leadRepo.saveWithOptimisticLock(updated, actualUpdatedAt);
        } catch (error: any) {
            if (error.message === 'OPTIMISTIC_LOCK_FAILED') {
                throw new ConflictError('Concurrent modification detected during assignment check.');
            }
            throw error;
        }

        // Log Status History / Assignment change
        await this.auditService.logStatusChange({
            entityName: 'admission_leads',
            entityId: saved.id,
            oldStatus: lead.status,
            newStatus: saved.status,
            changedBy: null,
            reason: `Counselor assigned via strategy: ${strategyType}`,
            metadata: { counselor_id: counselorId, strategy: strategyType },
            correlationId,
            eventName: 'LeadCounselorAssigned'
        });

        // Audit Log
        await this.auditService.logAudit({
            userId: null,
            action: 'ASSIGN_COUNSELOR',
            entityName: 'admission_leads',
            entityId: saved.id,
            beforeState,
            afterState: saved,
            correlationId
        });

        return saved;
    }
}
