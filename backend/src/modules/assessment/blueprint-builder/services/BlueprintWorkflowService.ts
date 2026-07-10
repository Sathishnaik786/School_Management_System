import { BaseService } from '../../../admission/services/BaseService';
import { BlueprintRepository } from '../repositories/BlueprintRepository';
import { BlueprintValidator } from '../validators/BlueprintValidator';
import { BlueprintVersionRepository } from '../repositories/BlueprintVersionRepository';
import { AuditService } from '../../../admission/services/AuditService';
import { EventBus } from '../../../../workflows/event-bus.service';
import { BusinessRuleError } from '../../../admission/errors/BusinessRuleError';
import { supabase } from '../../../../config/supabase';

export class BlueprintWorkflowService extends BaseService {
    private readonly blueprintRepo = new BlueprintRepository();
    private readonly versionRepo = new BlueprintVersionRepository();
    private readonly audit = new AuditService();

    public async transitionStatus(
        blueprintId: string,
        schoolId: string,
        userId: string,
        payload: any,
        correlationId?: string
    ): Promise<any> {
        const validated = BlueprintValidator.validateWorkflow(payload);
        this.logInfo(`Transitioning status of blueprint: ${blueprintId} to status: ${validated.target_status}`, correlationId);

        const blueprint = await this.blueprintRepo.findBlueprintById(blueprintId, schoolId);
        if (!blueprint) {
            throw new BusinessRuleError('Blueprint header context not found.');
        }

        const currentStatus = blueprint.status;
        const targetStatus = validated.target_status;

        // Verify valid transitions
        const allowedTransitions: Record<string, string[]> = {
            'DRAFT': ['UNDER_REVIEW', 'ARCHIVED'],
            'UNDER_REVIEW': ['APPROVED', 'DRAFT'],
            'APPROVED': ['PUBLISHED', 'ARCHIVED'],
            'PUBLISHED': ['ARCHIVED'],
            'ARCHIVED': ['DRAFT']
        };

        const allowed = allowedTransitions[currentStatus] || [];
        if (!allowed.includes(targetStatus)) {
            throw new BusinessRuleError(`Transition from "${currentStatus}" to "${targetStatus}" is not allowed.`);
        }

        // Create a snapshot version if we transition to APPROVED or PUBLISHED
        if (targetStatus === 'PUBLISHED' || targetStatus === 'APPROVED') {
            await this.versionRepo.createVersion(blueprintId, blueprint.version, blueprint);
        }

        // Update status
        const { data, error } = await supabase
            .from('assessment_blueprints')
            .update({
                status: targetStatus,
                updated_at: new Date().toISOString()
            })
            .eq('id', blueprintId)
            .select()
            .single();

        if (error) throw error;

        await this.audit.logAudit({
            userId,
            action: 'ASSESSMENT_BLUEPRINT_WORKFLOW_TRANSITION',
            entityName: 'assessment_blueprints',
            entityId: blueprintId,
            beforeState: { id: blueprintId, status: currentStatus },
            afterState: { id: blueprintId, status: targetStatus, reason: validated.transition_reason },
            correlationId
        });

        // Publish Events
        if (targetStatus === 'PUBLISHED') {
            await EventBus.publish('BlueprintPublished', { blueprintId, schoolId, userId });
        } else if (targetStatus === 'ARCHIVED') {
            await EventBus.publish('BlueprintArchived', { blueprintId, schoolId, userId });
        }

        return data;
    }
}
export default BlueprintWorkflowService;
