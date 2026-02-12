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
    },

    async publishTickets(req: Request, res: Response) {
        try {
            const { examId } = req.body;
            const userId = req.context!.user.id;

            if (!examId) return res.status(400).json({ error: "Exam ID required" });

            const result = await ExamHallTicketService.publishHallTickets(examId, userId);
            res.json(result);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    },

    async generateStudentPDF(req: Request, res: Response) {
        try {
            const { examId, studentId } = req.params;
            const schoolId = req.context!.user.school_id;

            console.log(`[ExamHallTicketController] Generating PDF for Student: ${studentId}, Exam: ${examId}`);

            if (!examId || !studentId) return res.status(400).json({ error: "Exam ID and Student ID required" });

            const pdfBuffer = await ExamHallTicketService.generateHallTicketPDF(examId, studentId, schoolId);

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="HallTicket_${studentId}.pdf"`);
            res.send(pdfBuffer);
        } catch (err: any) {
            console.error(`[ExamHallTicketController] PDF Generation Failed:`, {
                message: err.message,
                stack: err.stack,
                params: req.params
            });
            const status = err.message?.includes('NOT_FOUND') ? 404 :
                err.message?.includes('PUBLISHED') ? 403 : 500;
            res.status(status).json({ error: err.message || 'Internal server error' });
        }
    },

    async bulkReissueZip(req: Request, res: Response) {
        try {
            const { examId } = req.params;
            const schoolId = req.context!.user.school_id;

            console.log(`[ExamHallTicketController] Generating Bulk ZIP for Exam: ${examId}`);

            if (!examId) return res.status(400).json({ error: "Exam ID required" });

            const zipBuffer = await ExamHallTicketService.generateBulkHallTicketsZip(examId, schoolId);

            res.setHeader('Content-Type', 'application/zip');
            res.setHeader('Content-Disposition', `attachment; filename="HallTickets_Exam_${examId}.zip"`);
            res.send(zipBuffer);
        } catch (err: any) {
            console.error(`[ExamHallTicketController] Bulk ZIP Generation Failed:`, {
                message: err.message,
                stack: err.stack,
                params: req.params
            });
            res.status(500).json({ error: err.message || 'Internal server error' });
        }
    }
};
