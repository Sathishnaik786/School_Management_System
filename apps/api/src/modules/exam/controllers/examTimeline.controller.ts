import { Request, Response } from 'express';
import { ExamTimelineProjectionService } from '../services/ExamTimelineProjection.service';

export const ExamTimelineController = {
    async getStudentTimeline(req: Request, res: Response) {
        try {
            // In a real app, studentId might be linked to the user context
            // For this design, we'll try to get it from context if available, or params
            const schoolId = req.context!.user.school_id;
            const studentId = req.query.studentId as string;

            if (!studentId) {
                return res.status(400).json({ error: 'studentId is required as a query parameter' });
            }

            const timeline = await ExamTimelineProjectionService.getStudentTimeline(studentId, schoolId);
            res.json(timeline);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    },

    async getFacultyTimeline(req: Request, res: Response) {
        try {
            const schoolId = req.context!.user.school_id;
            const userId = req.context!.user.id;

            const projection = await ExamTimelineProjectionService.getFacultyTimeline(userId, schoolId);
            res.json(projection);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    }
};
