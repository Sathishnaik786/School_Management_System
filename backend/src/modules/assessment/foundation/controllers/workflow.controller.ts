import { Request, Response } from 'express';
import { WorkflowEngineService } from '../services/workflow-engine.service';

export class WorkflowController {
    private static workflowService = new WorkflowEngineService();

    /**
     * Lists active workflows for the school.
     */
    public static async listWorkflows(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            if (!schoolId) {
                return res.status(400).json({ error: 'School context could not be resolved.' });
            }

            const workflows = await WorkflowController.workflowService.listWorkflows(schoolId);
            return res.status(200).json(workflows);
        } catch (error: any) {
            console.error('[WORKFLOW LIST ERROR]', error);
            return res.status(error.status || 500).json({ error: error.message || 'Failed to list workflows' });
        }
    }

    /**
     * Retrieves a single workflow with nested details.
     */
    public static async getWorkflowById(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const { id } = req.params;
            if (!schoolId) {
                return res.status(400).json({ error: 'School context could not be resolved.' });
            }

            const workflow = await WorkflowController.workflowService.getWorkflowById(id, schoolId);
            return res.status(200).json(workflow);
        } catch (error: any) {
            console.error('[WORKFLOW GET ERROR]', error);
            return res.status(error.status || 500).json({ error: error.message || 'Failed to fetch workflow' });
        }
    }

    /**
     * Creates a workflow with associated steps and transitions.
     */
    public static async createWorkflow(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            if (!schoolId || !userId) {
                return res.status(400).json({ error: 'School or User context could not be resolved.' });
            }

            const workflow = await WorkflowController.workflowService.createWorkflow(schoolId, userId, req.body);
            return res.status(201).json(workflow);
        } catch (error: any) {
            console.error('[WORKFLOW CREATE ERROR]', error);
            return res.status(error.status || 400).json({ error: error.message || 'Failed to create workflow' });
        }
    }

    /**
     * Updates workflow parameters and nested tables.
     */
    public static async updateWorkflow(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            const { id } = req.params;
            if (!schoolId || !userId) {
                return res.status(400).json({ error: 'School or User context could not be resolved.' });
            }

            const workflow = await WorkflowController.workflowService.updateWorkflow(id, schoolId, userId, req.body);
            return res.status(200).json(workflow);
        } catch (error: any) {
            console.error('[WORKFLOW UPDATE ERROR]', error);
            return res.status(error.status || 400).json({ error: error.message || 'Failed to update workflow' });
        }
    }

    /**
     * Soft deletes a workflow.
     */
    public static async deleteWorkflow(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            const { id } = req.params;
            if (!schoolId || !userId) {
                return res.status(400).json({ error: 'School or User context could not be resolved.' });
            }

            await WorkflowController.workflowService.deleteWorkflow(id, schoolId, userId);
            return res.status(200).json({ message: 'Workflow successfully deleted.' });
        } catch (error: any) {
            console.error('[WORKFLOW DELETE ERROR]', error);
            return res.status(error.status || 400).json({ error: error.message || 'Failed to delete workflow' });
        }
    }
}
