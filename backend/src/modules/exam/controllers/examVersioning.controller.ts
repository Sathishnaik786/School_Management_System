import { Request, Response } from 'express';
import { ExamVersioningService } from '../services/examVersioning.service';

export const ExamVersioningController = {
    /**
     * Get all seating versions for an exam
     */
    async getSeatingVersions(req: Request, res: Response) {
        try {
            const { examId } = req.params;
            if (!examId) return res.status(400).json({ error: "Exam ID required" });

            const data = await ExamVersioningService.getSeatingVersions(examId);
            res.json(data);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    },

    /**
     * Get all result versions for an exam
     */
    async getResultVersions(req: Request, res: Response) {
        try {
            const { examId } = req.params;
            if (!examId) return res.status(400).json({ error: "Exam ID required" });

            const data = await ExamVersioningService.getResultVersions(examId);
            res.json(data);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    },

    /**
     * Restore a specific seating version
     */
    async restoreSeatingVersion(req: Request, res: Response) {
        try {
            const { examId, version } = req.params;
            const userId = req.context!.user.id;

            if (!examId || !version) return res.status(400).json({ error: "Exam ID and Version Number required" });

            const result = await ExamVersioningService.restoreSeatingVersion(examId, parseInt(version), userId);
            res.json(result);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    }
};
