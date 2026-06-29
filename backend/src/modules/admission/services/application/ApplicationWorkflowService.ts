import { BaseService } from '../BaseService';
import { ApplicationRepository } from '../../repositories/application/ApplicationRepository';
import { ApplicationValidationService } from './ApplicationValidationService';
import { AdmissionApplication } from '../../domain/application/AdmissionApplication';
import { NotFoundError } from '../../errors/NotFoundError';
import { BusinessRuleError } from '../../errors/BusinessRuleError';
import { AuditService } from '../AuditService';
import { supabase } from '../../../../config/supabase';

export class ApplicationWorkflowService extends BaseService {
    constructor(
        private readonly appRepo: ApplicationRepository,
        private readonly valService: ApplicationValidationService,
        private readonly auditService: AuditService
    ) {
        super();
    }

    /**
     * Executes transition status updates securely on the application header.
     */
    public async transitionTo(
        applicationId: string,
        newStatus: any,
        role: string,
        performedBy: string | null,
        notes?: string | null,
        correlationId?: string
    ): Promise<AdmissionApplication> {
        const application = await this.appRepo.findById(applicationId);
        if (!application) {
            throw new NotFoundError(`Application with ID ${applicationId} not found`);
        }

        const oldStatus = application.status;
        if (oldStatus === newStatus) {
            return application;
        }

        // Validate Transition constraints
        await this.valService.validateWorkflowTransition(oldStatus, newStatus, role);

        // Update state
        application.updateStatus(newStatus, notes);
        await this.appRepo.save(application);

        // Track timeline history log
        await this.appRepo.logWorkflow(applicationId, `STATUS_TRANSITION`, oldStatus, newStatus, performedBy, notes);

        // Track status_history details record
        await supabase
            .from('status_history')
            .insert({
                entity_name: 'admission_applications',
                entity_id: applicationId,
                old_status: oldStatus,
                new_status: newStatus,
                reason: notes || `State transition to ${newStatus}`,
                correlation_id: correlationId,
                event_name: `ApplicationStateChanged`
            });

        // Audit log trigger
        await this.auditService.logAudit({
            action: 'APPLICATION_STATUS_TRANSITION',
            entityName: 'admission_applications',
            entityId: applicationId,
            beforeState: { status: oldStatus },
            afterState: { status: newStatus, notes },
            userId: performedBy,
            correlationId
        });

        return application;
    }
}
