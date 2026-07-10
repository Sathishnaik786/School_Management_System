import { BaseService } from '../../../admission/services/BaseService';
import { WorkflowDefinitionRepository } from '../repositories/WorkflowDefinitionRepository';
import { WorkflowStepRepository } from '../repositories/WorkflowStepRepository';
import { WorkflowTransitionRepository } from '../repositories/WorkflowTransitionRepository';
import { createWorkflowSchema, updateWorkflowSchema } from '../dto/workflow.dto';
import { AuditService } from '../../../admission/services/AuditService';
import { EventBus } from '../../../../workflows/event-bus.service';
import { NotFoundError } from '../../../admission/errors/NotFoundError';

export class WorkflowDefinitionService extends BaseService {
    private readonly definitionRepo = new WorkflowDefinitionRepository();
    private readonly stepRepo = new WorkflowStepRepository();
    private readonly transitionRepo = new WorkflowTransitionRepository();
    private readonly audit = new AuditService();

    public async listWorkflows(schoolId: string, correlationId?: string): Promise<any[]> {
        this.logInfo(`Listing workflows for school: ${schoolId}`, correlationId);
        return this.definitionRepo.listAll(schoolId);
    }

    public async getWorkflowById(id: string, schoolId: string, correlationId?: string): Promise<any> {
        this.logInfo(`Fetching workflow details for: ${id}`, correlationId);
        const definition = await this.definitionRepo.findById(id, schoolId);
        if (!definition) {
            throw new NotFoundError(`Workflow definition not found with ID: ${id}`);
        }

        const steps = await this.stepRepo.findByWorkflowId(id);
        const transitions = await this.transitionRepo.findByWorkflowId(id);

        return {
            ...definition,
            steps,
            transitions
        };
    }

    public async createWorkflow(schoolId: string, userId: string, payload: any, correlationId?: string): Promise<any> {
        const validated = this.validate(createWorkflowSchema, payload);
        this.logInfo(`Creating workflow "${validated.name}" for school: ${schoolId}`, correlationId);

        const { steps, transitions, ...definitionData } = validated;

        // 1. Create definition
        const definition = await this.definitionRepo.create({
            ...definitionData,
            school_id: schoolId,
            version: 1,
            is_active: true
        });

        // 2. Create steps
        let createdSteps: any[] = [];
        if (steps && steps.length > 0) {
            const stepsPayload = steps.map(s => ({
                ...s,
                workflow_id: definition.id
            }));
            createdSteps = await this.stepRepo.createBulk(stepsPayload);
        }

        // 3. Create transitions
        let createdTransitions: any[] = [];
        if (transitions && transitions.length > 0) {
            const transitionsPayload = transitions.map(t => ({
                ...t,
                workflow_id: definition.id
            }));
            createdTransitions = await this.transitionRepo.createBulk(transitionsPayload);
        }

        const result = {
            ...definition,
            steps: createdSteps,
            transitions: createdTransitions
        };

        // Audit Log
        await this.audit.logAudit({
            userId,
            action: 'ASSESSMENT_WORKFLOW_CREATE',
            entityName: 'assessment_workflow_definitions',
            entityId: definition.id,
            afterState: result,
            correlationId
        });

        // Publish Event
        await EventBus.publish('AssessmentWorkflowCreated', { workflowId: definition.id, schoolId, userId });

        return result;
    }

    public async updateWorkflow(
        id: string,
        schoolId: string,
        userId: string,
        payload: any,
        correlationId?: string
    ): Promise<any> {
        const validated = this.validate(updateWorkflowSchema, payload);
        this.logInfo(`Updating workflow definition: ${id}`, correlationId);

        const beforeState = await this.getWorkflowById(id, schoolId, correlationId);
        const { steps, transitions, ...definitionData } = validated;

        // 1. Update main definition
        const updatedDefinition = await this.definitionRepo.update(id, schoolId, definitionData);

        // 2. Update steps if provided
        if (steps) {
            await this.stepRepo.deleteByWorkflowId(id);
            if (steps.length > 0) {
                const stepsPayload = steps.map(s => ({
                    ...s,
                    workflow_id: id
                }));
                await this.stepRepo.createBulk(stepsPayload);
            }
        }

        // 3. Update transitions if provided
        if (transitions) {
            await this.transitionRepo.deleteByWorkflowId(id);
            if (transitions.length > 0) {
                const transitionsPayload = transitions.map(t => ({
                    ...t,
                    workflow_id: id
                }));
                await this.transitionRepo.createBulk(transitionsPayload);
            }
        }

        const result = await this.getWorkflowById(id, schoolId, correlationId);

        // Audit Log
        await this.audit.logAudit({
            userId,
            action: 'ASSESSMENT_WORKFLOW_UPDATE',
            entityName: 'assessment_workflow_definitions',
            entityId: id,
            beforeState,
            afterState: result,
            correlationId
        });

        // Detect publish or archive events to emit custom signals
        if (validated.is_active === true && beforeState.is_active === false) {
            await EventBus.publish('AssessmentWorkflowPublished', { workflowId: id, schoolId, userId });
        } else if (validated.is_active === false && beforeState.is_active === true) {
            await EventBus.publish('AssessmentWorkflowArchived', { workflowId: id, schoolId, userId });
        }

        return result;
    }

    public async deleteWorkflow(id: string, schoolId: string, userId: string, correlationId?: string): Promise<void> {
        this.logInfo(`Soft deleting workflow: ${id}`, correlationId);
        const beforeState = await this.getWorkflowById(id, schoolId, correlationId);

        await this.definitionRepo.softDelete(id, schoolId, userId);

        // Audit Log
        await this.audit.logAudit({
            userId,
            action: 'ASSESSMENT_WORKFLOW_DELETE',
            entityName: 'assessment_workflow_definitions',
            entityId: id,
            beforeState,
            afterState: { ...beforeState, is_deleted: true },
            correlationId
        });
    }
}
