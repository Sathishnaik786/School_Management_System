import { Request, Response } from 'express';
import { WorkflowDefinitionService } from '../services/WorkflowDefinitionService';
import { WorkflowStepService } from '../services/WorkflowStepService';
import { WorkflowTransitionService } from '../services/WorkflowTransitionService';

export class WorkflowController {
    private static workflowService = new WorkflowDefinitionService();
    private static stepService = new WorkflowStepService();
    private static transitionService = new WorkflowTransitionService();

    // ==========================================
    // WORKFLOW DEFINITIONS
    // ==========================================
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

    public static async getWorkflow(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const schoolId = (req as any).context?.user?.school_id;
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

    public static async createWorkflow(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            if (!schoolId || !userId) {
                return res.status(400).json({ error: 'Context credentials could not be resolved.' });
            }
            const workflow = await WorkflowController.workflowService.createWorkflow(schoolId, userId, req.body);
            return res.status(201).json(workflow);
        } catch (error: any) {
            console.error('[WORKFLOW CREATE ERROR]', error);
            return res.status(error.status || 400).json({ error: error.message || 'Failed to create workflow' });
        }
    }

    public static async updateWorkflow(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            if (!schoolId || !userId) {
                return res.status(400).json({ error: 'Context credentials could not be resolved.' });
            }
            const workflow = await WorkflowController.workflowService.updateWorkflow(id, schoolId, userId, req.body);
            return res.status(200).json(workflow);
        } catch (error: any) {
            console.error('[WORKFLOW UPDATE ERROR]', error);
            return res.status(error.status || 400).json({ error: error.message || 'Failed to update workflow' });
        }
    }

    public static async deleteWorkflow(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            if (!schoolId || !userId) {
                return res.status(400).json({ error: 'Context credentials could not be resolved.' });
            }
            await WorkflowController.workflowService.deleteWorkflow(id, schoolId, userId);
            return res.status(200).json({ message: 'Workflow successfully deleted.' });
        } catch (error: any) {
            console.error('[WORKFLOW DELETE ERROR]', error);
            return res.status(error.status || 400).json({ error: error.message || 'Failed to delete workflow' });
        }
    }

    // ==========================================
    // WORKFLOW STEPS
    // ==========================================
    public static async getSteps(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params; // workflow definition ID
            const steps = await WorkflowController.stepService.getStepsByWorkflow(id);
            return res.status(200).json(steps);
        } catch (error: any) {
            return res.status(error.status || 500).json({ error: error.message || 'Failed to fetch steps' });
        }
    }

    public static async addStep(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params; // workflow definition ID
            const step = await WorkflowController.stepService.addStep(id, req.body);
            return res.status(201).json(step);
        } catch (error: any) {
            return res.status(error.status || 400).json({ error: error.message || 'Failed to add step' });
        }
    }

    public static async updateStep(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params; // step ID
            const updated = await WorkflowController.stepService.updateStep(id, req.body);
            return res.status(200).json(updated);
        } catch (error: any) {
            return res.status(error.status || 400).json({ error: error.message || 'Failed to update step' });
        }
    }

    public static async deleteStep(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params; // step ID
            await WorkflowController.stepService.removeStep(id);
            return res.status(200).json({ message: 'Step successfully deleted.' });
        } catch (error: any) {
            return res.status(error.status || 400).json({ error: error.message || 'Failed to delete step' });
        }
    }

    // ==========================================
    // WORKFLOW TRANSITIONS
    // ==========================================
    public static async getTransitions(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params; // workflow definition ID
            const transitions = await WorkflowController.transitionService.getTransitionsByWorkflow(id);
            return res.status(200).json(transitions);
        } catch (error: any) {
            return res.status(error.status || 500).json({ error: error.message || 'Failed to fetch transitions' });
        }
    }

    public static async addTransition(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params; // workflow definition ID
            const transition = await WorkflowController.transitionService.addTransition(id, req.body);
            return res.status(201).json(transition);
        } catch (error: any) {
            return res.status(error.status || 400).json({ error: error.message || 'Failed to add transition' });
        }
    }

    public static async updateTransition(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params; // transition ID
            const updated = await WorkflowController.transitionService.updateTransition(id, req.body);
            return res.status(200).json(updated);
        } catch (error: any) {
            return res.status(error.status || 400).json({ error: error.message || 'Failed to update transition' });
        }
    }

    public static async deleteTransition(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params; // transition ID
            await WorkflowController.transitionService.removeTransition(id);
            return res.status(200).json({ message: 'Transition successfully deleted.' });
        } catch (error: any) {
            return res.status(error.status || 400).json({ error: error.message || 'Failed to delete transition' });
        }
    }
}
