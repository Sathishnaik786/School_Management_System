import { Request, Response } from 'express';
import { supabase } from '../../../config/supabase';

export class SchedulingController {

    static async listSessions(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const { data, error } = await supabase
                .from('schedule_sessions')
                .select('*').eq('school_id', schoolId).order('start_time');
            if (error) throw error;
            return res.status(200).json(data);
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    }

    static async createSession(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const { name, start_time, end_time } = req.body;
            if (!name || !start_time || !end_time) return res.status(400).json({ error: 'name, start_time, end_time required.' });
            const { data, error } = await supabase
                .from('schedule_sessions')
                .insert({ school_id: schoolId, name, start_time, end_time })
                .select().single();
            if (error) throw error;
            return res.status(201).json(data);
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    }

    static async updateSession(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const { id } = req.params;
            const { data, error } = await supabase
                .from('schedule_sessions')
                .update({ ...req.body, updated_at: new Date().toISOString() })
                .eq('id', id).eq('school_id', schoolId).select().single();
            if (error) throw error;
            return res.status(200).json(data);
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    }

    static async deleteSession(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const { id } = req.params;
            const { error } = await supabase.from('schedule_sessions').delete().eq('id', id).eq('school_id', schoolId);
            if (error) throw error;
            return res.status(200).json({ message: 'Session deleted.' });
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    }

    static async listScheduleRooms(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const { exam_schedule_id } = req.query;
            let query = supabase
                .from('schedule_rooms')
                .select('*, exam_rooms(id, room_number, capacity, exam_buildings(name))')
                .eq('school_id', schoolId);
            if (exam_schedule_id) query = query.eq('exam_schedule_id', exam_schedule_id as string);
            const { data, error } = await query;
            if (error) throw error;
            return res.status(200).json(data);
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    }

    static async addScheduleRoom(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const { exam_schedule_id, room_id, allocated_capacity } = req.body;
            if (!exam_schedule_id || !room_id || allocated_capacity === undefined) {
                return res.status(400).json({ error: 'exam_schedule_id, room_id, allocated_capacity required.' });
            }
            const { data, error } = await supabase
                .from('schedule_rooms')
                .insert({ school_id: schoolId, exam_schedule_id, room_id, allocated_capacity })
                .select().single();
            if (error) throw error;
            return res.status(201).json(data);
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    }

    static async removeScheduleRoom(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const { id } = req.params;
            const { error } = await supabase.from('schedule_rooms').delete().eq('id', id).eq('school_id', schoolId);
            if (error) throw error;
            return res.status(200).json({ message: 'Schedule room removed.' });
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    }
}
