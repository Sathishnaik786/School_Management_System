import { BaseService } from '../../../admission/services/BaseService';
import { WorkflowTransitionRepository } from '../repositories/WorkflowTransitionRepository';
import { createWorkflowTransitionSchema } from '../dto/workflow.dto';
import { NotFoundError } from '../../../admission/errors/NotFoundError';

export class WorkflowTransitionService extends BaseService {
    private readonly transitionRepo = new WorkflowTransitionRepository();

    public async getTransitionsByWorkflow(workflowId: string, correlationId?: string): Promise<any[]> {
        this.logInfo(`Fetching transitions for workflow: ${workflowId}`, correlationId);
        return this.transitionRepo.findByWorkflowId(workflowId);
    }

    public async addTransition(workflowId: string, payload: any, correlationId?: string): Promise<any> {
        const validated = this.validate(createWorkflowTransitionSchema, payload);
        this.logInfo(`Adding transition to workflow: ${workflowId}`, correlationId);
        return this.transitionRepo.create({
            ...validated,
            workflow_id: workflowId
        });
    }

    public async updateTransition(id: string, payload: any, correlationId?: string): Promise<any> {
        this.logInfo(`Updating workflow transition: ${id}`, correlationId);
        const existing = await this.transitionRepo.findById(id);
        if (!existing) {
            throw new NotFoundError(`Transition not found with ID: ${id}`);
        }
        return this.transitionRepo.update(id, payload);
    }

    public async removeTransition(id: string, correlationId?: string): Promise<void> {
        this.logInfo(`Removing workflow transition: ${id}`, correlationId);
        const existing = await this.transitionRepo.findById(id);
        if (!existing) {
            throw new NotFoundError(`Transition not found with ID: ${id}`);
        }
        await this.transitionRepo.delete(id);
    }
}
