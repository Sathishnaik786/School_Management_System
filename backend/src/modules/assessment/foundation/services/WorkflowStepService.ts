import { BaseService } from '../../../admission/services/BaseService';
import { WorkflowStepRepository } from '../repositories/WorkflowStepRepository';
import { createWorkflowStepSchema } from '../dto/workflow.dto';
import { NotFoundError } from '../../../admission/errors/NotFoundError';

export class WorkflowStepService extends BaseService {
    private readonly stepRepo = new WorkflowStepRepository();

    public async getStepsByWorkflow(workflowId: string, correlationId?: string): Promise<any[]> {
        this.logInfo(`Fetching steps for workflow: ${workflowId}`, correlationId);
        return this.stepRepo.findByWorkflowId(workflowId);
    }

    public async addStep(workflowId: string, payload: any, correlationId?: string): Promise<any> {
        const validated = this.validate(createWorkflowStepSchema, payload);
        this.logInfo(`Adding step to workflow: ${workflowId}`, correlationId);
        return this.stepRepo.create({
            ...validated,
            workflow_id: workflowId
        });
    }

    public async updateStep(id: string, payload: any, correlationId?: string): Promise<any> {
        this.logInfo(`Updating workflow step: ${id}`, correlationId);
        const existing = await this.stepRepo.findById(id);
        if (!existing) {
            throw new NotFoundError(`Step not found with ID: ${id}`);
        }
        return this.stepRepo.update(id, payload);
    }

    public async removeStep(id: string, correlationId?: string): Promise<void> {
        this.logInfo(`Removing workflow step: ${id}`, correlationId);
        const existing = await this.stepRepo.findById(id);
        if (!existing) {
            throw new NotFoundError(`Step not found with ID: ${id}`);
        }
        await this.stepRepo.delete(id);
    }
}
