import { BaseService } from '../../../admission/services/BaseService';
import { QuestionRepository } from '../repositories/question.repository';
import { QuestionValidator } from '../validators/QuestionValidator';
import { AuditService } from '../../../admission/services/AuditService';
import { EventBus } from '../../../../workflows/event-bus.service';
import { BusinessRuleError } from '../../../admission/errors/BusinessRuleError';
import { supabase } from '../../../../config/supabase';

export class QuestionWorkflowService extends BaseService {
    private readonly questionRepo = new QuestionRepository();
    private readonly audit = new AuditService();

    public async transitionStatus(
        questionId: string,
        schoolId: string,
        userId: string,
        payload: any,
        correlationId?: string
    ): Promise<any> {
        const validated = QuestionValidator.validateWorkflow(payload);
        this.logInfo(`Transitioning status of question: ${questionId} to: ${validated.target_status}`, correlationId);

        const question = await this.questionRepo.findQuestionById(questionId, schoolId);
        if (!question) {
            throw new BusinessRuleError('Question context not found.');
        }

        const currentStatus = question.status;
        const targetStatus = validated.target_status;

        // Verify valid transition
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

        // Update status in database
        const { data, error } = await supabase
            .from('assessment_question_bank')
            .update({
                status: targetStatus,
                updated_at: new Date().toISOString()
            })
            .eq('id', questionId)
            .select()
            .single();

        if (error) throw error;

        // Audit Log
        await this.audit.logAudit({
            userId,
            action: 'ASSESSMENT_QUESTION_WORKFLOW_TRANSITION',
            entityName: 'assessment_question_bank',
            entityId: questionId,
            beforeState: { id: questionId, status: currentStatus },
            afterState: { id: questionId, status: targetStatus, reason: validated.transition_reason },
            correlationId
        });

        // Publish Events
        if (targetStatus === 'UNDER_REVIEW') {
            await EventBus.publish('QuestionReviewed', { questionId, schoolId, userId });
        } else if (targetStatus === 'APPROVED') {
            await EventBus.publish('QuestionApproved', { questionId, schoolId, userId });
        } else if (targetStatus === 'PUBLISHED') {
            await EventBus.publish('QuestionPublished', { questionId, schoolId, userId });
        } else if (targetStatus === 'ARCHIVED') {
            await EventBus.publish('QuestionArchived', { questionId, schoolId, userId });
        }

        return data;
    }
}
export default QuestionWorkflowService;
