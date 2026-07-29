import { Request, Response } from 'express';
import { ExamQuestionPaperService } from '../services/examQuestionPaper.service';

export const ExamQuestionPaperController = {
    async upload(req: Request, res: Response) {
        try {
            const { examScheduleId, fileUrl, fileName, status } = req.body;
            const userId = req.context!.user.id;

            if (!examScheduleId || !fileUrl || !fileName) {
                return res.status(400).json({ error: "Missing required fields" });
            }

            const data = await ExamQuestionPaperService.uploadPaper(examScheduleId, userId, fileUrl, fileName, status);
            res.status(201).json(data);
        } catch (err: any) {
            console.error("QP Upload Error:", err);
            res.status(500).json({ error: err.message });
        }
    },

    async lock(req: Request, res: Response) {
        try {
            const { examScheduleId } = req.body;
            const userId = req.context!.user.id;

            // Only Admin (Optional: Faculty Lead?)
            if (!req.context!.user.roles.includes('ADMIN')) {
                return res.status(403).json({ error: "Only admins can lock question papers." });
            }

            const data = await ExamQuestionPaperService.lockPaper(examScheduleId, userId);
            res.json(data);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    },

    async list(req: Request, res: Response) {
        try {
            const { examScheduleId } = req.query;
            if (!examScheduleId) return res.status(400).json({ error: "Exam Schedule ID required" });

            const data = await ExamQuestionPaperService.getPapers(examScheduleId as string);
            res.json(data);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    }
};
