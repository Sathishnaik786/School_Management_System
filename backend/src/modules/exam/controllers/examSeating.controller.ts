import { Request, Response } from 'express';
import { supabase } from '../../../config/supabase';
import { ExamSeatingService } from '../services/examSeating.service';
import { ExamNotificationService } from '../services/examNotification.service';

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
            const { hall_name, capacity, location } = req.body;

            const { data, error } = await supabase
                .from('exam_halls')
                .insert({ school_id: schoolId, hall_name, capacity, location })
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
            const { examScheduleId } = req.body;
            const userId = req.context!.user.id;
            const schoolId = req.context!.user.school_id;

            if (!examScheduleId) return res.status(400).json({ error: "Exam Schedule ID required" });

            const result = await ExamSeatingService.generateSeating(examScheduleId, userId, schoolId);
            res.json({ message: "Seating Generated Successfully", ...result });

            // Hook: Notify
            ExamNotificationService.notifyHallTicketReady(examScheduleId);


        } catch (err: any) {
            console.error("Seating Gen Error:", err);
            res.status(500).json({ error: err.message });
        }
    },

    async getSeatingView(req: Request, res: Response) {
        try {
            const { examScheduleId } = req.query;
            if (!examScheduleId) return res.status(400).json({ error: "Exam Schedule ID required" });

            const data = await ExamSeatingService.getSeating(examScheduleId as string);
            res.json(data);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    }
}
