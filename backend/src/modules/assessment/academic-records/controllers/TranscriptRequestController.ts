import { Request, Response } from 'express';
import { TranscriptRequestRepository } from '../repositories/TranscriptRequestRepository';
import { TranscriptService } from '../services/TranscriptService';

export class TranscriptRequestController {
    private static repo = new TranscriptRequestRepository();
    private static transcriptService = new TranscriptService();

    public static async createRequest(req: Request, res: Response): Promise<Response> {
        try {
            const { student_id } = req.body;
            const data = await TranscriptRequestController.repo.createRequest(student_id);
            return res.status(201).json(data);
        } catch (error: any) {
            return res.status(400).json({ error: error.message || 'Failed to submit transcript request.' });
        }
    }

    public static async generateTranscript(req: Request, res: Response): Promise<Response> {
        try {
            const { student_id } = req.body;
            const userId = (req as any).context?.user?.id;
            if (!userId) return res.status(400).json({ error: 'Context details missing.' });

            const data = await TranscriptRequestController.transcriptService.generateOfficialTranscript(
                student_id,
                userId
            );
            return res.status(200).json(data);
        } catch (error: any) {
            return res.status(400).json({ error: error.message || 'Failed to generate official transcript.' });
        }
    }
}
export default TranscriptRequestController;
