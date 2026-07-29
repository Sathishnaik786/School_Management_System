import { BaseService } from '../../../admission/services/BaseService';
import { FoundationRepository } from '../repositories/foundation.repository';
import { createWorkflowSchema, updateWorkflowSchema, CreateWorkflowDto, UpdateWorkflowDto } from '../dto/workflow.dto';
import { AuditService } from '../../../admission/services/AuditService';
import { NotFoundError } from '../../../admission/errors/NotFoundError';

export class WorkflowEngineService extends BaseService {
    private readonly repo: FoundationRepository;
    private readonly auditService: AuditService;

    constructor() {
        super();
        this.repo = new FoundationRepository();
        this.auditService = new AuditService();
    }

    /**
     * Lists active workflows for a school.
     */
    public async listWorkflows(schoolId: string, correlationId?: string): Promise<any[]> {
        this.logInfo(`Listing workflows for school: ${schoolId}`, correlationId);
        return this.repo.listWorkflows(schoolId);
    }

    /**
     * Resolves a single workflow by ID.
     */
    public async getWorkflowById(workflowId: string, schoolId: string, correlationId?: string): Promise<any> {
        this.logInfo(`Fetching workflow: ${workflowId}`, correlationId);
        const workflow = await this.repo.findWorkflowById(workflowId, schoolId);
        if (!workflow) {
            throw new NotFoundError(`Workflow not found with ID: ${workflowId}`);
        }
        return workflow;
    }

    /**
     * Creates a new workflow, validating the input schemas.
     */
    public async createWorkflow(
        schoolId: string,
        userId: string,
        payload: CreateWorkflowDto,
        correlationId?: string
    ): Promise<any> {
        const validated = this.validate(createWorkflowSchema, payload);
        this.logInfo(`Creating workflow "${validated.name}" for school: ${schoolId}`, correlationId);

        const newWorkflow = await this.repo.createWorkflow(schoolId, validated);

        await this.auditService.logAudit({
            userId,
            action: 'ASSESSMENT_WORKFLOW_CREATE',
            entityName: 'assessment_workflow_definitions',
            entityId: newWorkflow.id,
            afterState: newWorkflow,
            correlationId
        });

        return newWorkflow;
    }

    /**
     * Updates an existing workflow, logging changes in the audit logs.
     */
    public async updateWorkflow(
        workflowId: string,
        schoolId: string,
        userId: string,
        payload: UpdateWorkflowDto,
        correlationId?: string
    ): Promise<any> {
        const validated = this.validate(updateWorkflowSchema, payload);
        this.logInfo(`Updating workflow: ${workflowId}`, correlationId);

        const beforeState = await this.getWorkflowById(workflowId, schoolId, correlationId);
        const updatedWorkflow = await this.repo.updateWorkflow(workflowId, schoolId, validated);

        await this.auditService.logAudit({
            userId,
            action: 'ASSESSMENT_WORKFLOW_UPDATE',
            entityName: 'assessment_workflow_definitions',
            entityId: workflowId,
            beforeState,
            afterState: updatedWorkflow,
            correlationId
        });

        return updatedWorkflow;
    }

    /**
     * Soft deletes a workflow definition.
     */
    public async deleteWorkflow(
        workflowId: string,
        schoolId: string,
        userId: string,
        correlationId?: string
    ): Promise<void> {
        this.logInfo(`Soft deleting workflow: ${workflowId}`, correlationId);

        const beforeState = await this.getWorkflowById(workflowId, schoolId, correlationId);
        await this.repo.deleteWorkflow(workflowId, schoolId, userId);

        await this.auditService.logAudit({
            userId,
            action: 'ASSESSMENT_WORKFLOW_DELETE',
            entityName: 'assessment_workflow_definitions',
            entityId: workflowId,
            beforeState,
            afterState: { ...beforeState, is_deleted: true },
            correlationId
        });
    }

    /**
     * Dynamic verification checking if a transition is valid under registered transitions rules.
     */
    public async validateTransition(
        workflowId: string,
        schoolId: string,
        fromStatus: string,
        toStatus: string,
        correlationId?: string
    ): Promise<boolean> {
        const workflow = await this.getWorkflowById(workflowId, schoolId, correlationId);
        const transition = workflow.transitions.find(
            (t: any) => t.from_status === fromStatus && t.to_status === toStatus
        );

        if (!transition) {
            this.logInfo(`Transition from "${fromStatus}" to "${toStatus}" is invalid/unregistered`, correlationId);
            return false;
        }

        return true;
    }
}
