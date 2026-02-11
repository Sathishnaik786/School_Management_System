import { Request, Response } from 'express';
import { ExamHallTicketService } from '../services/examHallTicket.service';

export const ExamHallTicketController = {
    async generateTickets(req: Request, res: Response) {
        try {
            const { examId } = req.body;
            const userId = req.context!.user.id;
            const schoolId = req.context!.user.school_id;

            if (!examId) return res.status(400).json({ error: "Exam ID required" });

            const result = await ExamHallTicketService.generateHallTickets(examId, userId, schoolId);
            res.json(result);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    },

    async getHallTickets(req: Request, res: Response) {
        try {
            const { examId } = req.query;
            if (!examId) return res.status(400).json({ error: "Exam ID required" });

            const data = await ExamHallTicketService.getHallTickets(examId as string);
            res.json(data);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    },

    async getMyHallTicket(req: Request, res: Response) {
        try {
            const { examId } = req.query;
            const studentId = req.query.studentId as string; // Or from context if student logged in

            if (!examId || !studentId) return res.status(400).json({ error: "Exam ID and Student ID required" });

            const data = await ExamHallTicketService.getStudentHallTicket(studentId, examId as string);
            if (!data) return res.status(404).json({ error: "Hall ticket not found" });

            res.json(data);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    }
};
