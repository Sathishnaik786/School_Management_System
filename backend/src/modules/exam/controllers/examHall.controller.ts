import { Request, Response } from 'express';
import { ExamHallService } from '../services/examHall.service';

export const ExamHallController = {
    /**
     * GET /api/v1/exam-halls
     */
    async listHalls(req: Request, res: Response) {
        try {
            const schoolId = req.context!.user.school_id;
            const data = await ExamHallService.listHalls(schoolId);
            res.json(data);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    },

    /**
     * POST /api/v1/exam-halls
     */
    async createHall(req: Request, res: Response) {
        try {
            const schoolId = req.context!.user.school_id;
            const hall = await ExamHallService.createHall({
                ...req.body,
                school_id: schoolId
            });
            res.status(201).json(hall);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    },

    /**
     * PUT /api/v1/exam-halls/:id
     */
    async updateHall(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const schoolId = req.context!.user.school_id;
            const hall = await ExamHallService.updateHall(id, schoolId, req.body);
            res.json(hall);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    },

    /**
     * DELETE /api/v1/exam-halls/:id
     */
    async deleteHall(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const schoolId = req.context!.user.school_id;
            const result = await ExamHallService.deleteHall(id, schoolId);
            res.json(result);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    },

    /**
     * PATCH /api/v1/exam-halls/:id/toggle
     */
    async toggleActive(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const schoolId = req.context!.user.school_id;
            const hall = await ExamHallService.toggleActive(id, schoolId);
            res.json(hall);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    }
};
