import { Request, Response } from 'express';
import { GenerationJobService } from '../services/GenerationJobService';
import { GenerationJobRepository } from '../repositories/GenerationJobRepository';
import { PaperValidator } from '../validators/PaperValidator';

export class GenerationJobController {
    private static jobService = new GenerationJobService();
    private static jobRepo = new GenerationJobRepository();

    public static async listJobs(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            if (!schoolId) return res.status(400).json({ error: 'School context could not be resolved.' });

            const jobs = await GenerationJobController.jobRepo.listJobs(schoolId);
            return res.status(200).json(jobs);
        } catch (error: any) {
            return res.status(500).json({ error: error.message || 'Failed to list generation jobs.' });
        }
    }

    public static async createJob(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            if (!schoolId || !userId) return res.status(400).json({ error: 'Context credentials could not be resolved.' });

            const validated = PaperValidator.validateGenerationJob(req.body);
            // Additional details needed for paper generation
            const payload = {
                blueprint_id: validated.blueprint_id,
                template_id: validated.template_id,
                subject_id: req.body.subject_id,
                name: req.body.name,
                description: req.body.description
            };

            const job = await GenerationJobController.jobService.queueGenerationJob(schoolId, userId, payload);
            return res.status(202).json(job);
        } catch (error: any) {
            return res.status(400).json({ error: error.message || 'Failed to queue generation job.' });
        }
    }
}
export default GenerationJobController;
