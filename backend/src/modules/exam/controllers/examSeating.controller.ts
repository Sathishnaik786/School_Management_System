import { Request, Response } from 'express';
import { supabase } from '../../../config/supabase';
import { ExamSeatingService } from '../services/examSeating.service';

export const ExamSeatingController = {
    // HALLS MANAGEMENT
    async getHalls(req: Request, res: Response) {
        try {
            const schoolId = req.context!.user.school_id;
            const { data, error } = await supabase.from('exam_halls').select('*').eq('school_id', schoolId).order('hall_name');
            if (error) throw error;
            res.json(data);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    },

    async createHall(req: Request, res: Response) {
        try {
            const schoolId = req.context!.user.school_id;
            const { hall_name, capacity, location, rows_count, cols_count } = req.body;

            const { data, error } = await supabase
                .from('exam_halls')
                .insert({
                    school_id: schoolId,
                    hall_name,
                    capacity,
                    location,
                    rows_count,
                    cols_count
                })
                .select()
                .single();

            if (error) throw error;
            res.status(201).json(data);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    },

    async deleteHall(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { error } = await supabase.from('exam_halls').delete().eq('id', id);
            if (error) throw error;
            res.json({ message: "Deleted" });
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    },

    // ALLOCATION
    async generateSeating(req: Request, res: Response) {
        try {
            const { examId, classId } = req.body;
            const userId = req.context!.user.id;
            const schoolId = req.context!.user.school_id;

            if (!examId) return res.status(400).json({ error: "Exam ID required" });

            const result = await ExamSeatingService.generateSeating(examId, classId, userId, schoolId);
            res.json({ message: "Seating Generated Successfully", ...result });
        } catch (err: any) {
            console.error("Seating Gen Error:", err);
            res.status(500).json({ error: err.message });
        }
    },

    async getSeatingView(req: Request, res: Response) {
        try {
            const { examId } = req.query;
            if (!examId) return res.status(400).json({ error: "Exam ID required" });

            const data = await ExamSeatingService.getSeatingView(examId as string);
            res.json(data);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    },

    async getEligibleStudents(req: Request, res: Response) {
        try {
            const { examId } = req.query;
            if (!examId) return res.status(400).json({ error: "Exam ID required" });

            const data = await ExamSeatingService.getEligibleStudents(examId as string);
            res.json(data);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    },

    async publishSeating(req: Request, res: Response) {
        try {
            const { examId } = req.body;
            const userId = req.context!.user.id;
            const schoolId = req.context!.user.school_id;

            if (!examId) return res.status(400).json({ error: "Exam ID required" });

            const result = await ExamSeatingService.publishSeating(examId, userId, schoolId);
            res.json(result);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    },

    async resetSeating(req: Request, res: Response) {
        try {
            const { examId } = req.body;
            if (!examId) return res.status(400).json({ error: "Exam ID required" });

            const result = await ExamSeatingService.resetSeating(examId);
            res.json(result);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    }
}

