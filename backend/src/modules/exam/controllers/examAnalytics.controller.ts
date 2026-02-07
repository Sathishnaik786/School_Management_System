import { Request, Response } from 'express';
import { ExamAnalyticsService } from '../services/examAnalytics.service';

export const ExamAnalyticsController = {
    async getOverview(req: Request, res: Response) {
        try {
            const { examId } = req.query;
            if (!examId) return res.status(400).json({ error: "Exam ID required" });

            const data = await ExamAnalyticsService.getExamOverview(examId as string);
            res.json(data);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    },

    async getGrades(req: Request, res: Response) {
        try {
            const { examId } = req.query;
            if (!examId) return res.status(400).json({ error: "Exam ID required" });

            const data = await ExamAnalyticsService.getGradeDistribution(examId as string);
            res.json(data);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    },

    async getSubjects(req: Request, res: Response) {
        try {
            const { examId } = req.query;
            if (!examId) return res.status(400).json({ error: "Exam ID required" });

            const data = await ExamAnalyticsService.getSubjectPerformance(examId as string);
            res.json(data);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    },

    async getTopPerformers(req: Request, res: Response) {
        try {
            const { examId, limit } = req.query;
            if (!examId) return res.status(400).json({ error: "Exam ID required" });

            const data = await ExamAnalyticsService.getTopPerformers(examId as string, Number(limit) || 5);
            res.json(data);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    }
};
