import { BaseService } from '../../../admission/services/BaseService';
import { TemplateRepository } from '../repositories/template.repository';
import { TemplateValidator } from '../validators/TemplateValidator';
import { AuditService } from '../../../admission/services/AuditService';
import { EventBus } from '../../../../workflows/event-bus.service';
import { BusinessRuleError } from '../../../admission/errors/BusinessRuleError';
import { supabase } from '../../../../config/supabase';

export class TemplateWorkflowService extends BaseService {
    private readonly repo = new TemplateRepository();
    private readonly audit = new AuditService();

    public async transitionStatus(
        templateId: string,
        schoolId: string,
        userId: string,
        payload: any,
        correlationId?: string
    ): Promise<any> {
        const validated = TemplateValidator.validateWorkflow(payload);
        this.logInfo(`Transitioning template: ${templateId} status to: ${validated.target_status}`, correlationId);

        const template = await this.repo.findTemplateById(templateId, schoolId);
        if (!template) throw new Error('Template context not found.');

        const currentStatus = template.status;
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

        const { data, error } = await supabase
            .from('assessment_templates')
            .update({
                status: targetStatus,
                updated_at: new Date().toISOString()
            })
            .eq('id', templateId)
            .select()
            .single();

        if (error) throw error;

        await this.audit.logAudit({
            userId,
            action: 'ASSESSMENT_TEMPLATE_WORKFLOW_TRANSITION',
            entityName: 'assessment_templates',
            entityId: templateId,
            beforeState: { id: templateId, status: currentStatus },
            afterState: { id: templateId, status: targetStatus, reason: validated.transition_reason },
            correlationId
        });

        // Publish Events
        if (targetStatus === 'PUBLISHED') {
            await EventBus.publish('TemplatePublished', { templateId, schoolId, userId });
        } else if (targetStatus === 'ARCHIVED') {
            await EventBus.publish('TemplateArchived', { templateId, schoolId, userId });
        }

        return data;
    }
}
export default TemplateWorkflowService;
