import { Request, Response } from 'express';
import { supabase } from '../../../config/supabase';

export class InvigilationController {

    static async listAssignments(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const { exam_schedule_id } = req.query;
            let query = supabase
                .from('invigilator_assignments')
                .select('*, faculty_profiles(id, users(id, first_name, last_name, email)), exam_rooms(id, room_number), exam_schedules(id, exam_date, subject_name)')
                .eq('school_id', schoolId);
            if (exam_schedule_id) query = query.eq('exam_schedule_id', exam_schedule_id as string);
            const { data, error } = await query.order('created_at', { ascending: false });
            if (error) throw error;
            return res.status(200).json(data);
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    }

    static async assign(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const { exam_schedule_id, room_id, faculty_profile_id, role } = req.body;
            if (!exam_schedule_id || !room_id || !faculty_profile_id) {
                return res.status(400).json({ error: 'exam_schedule_id, room_id, and faculty_profile_id are required.' });
            }
            const { data, error } = await supabase
                .from('invigilator_assignments')
                .insert({ school_id: schoolId, exam_schedule_id, room_id, faculty_profile_id, role: role || 'INVIGILATOR', status: 'ASSIGNED' })
                .select().single();
            if (error) throw error;
            return res.status(201).json(data);
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    }

    static async updateStatus(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const { id } = req.params;
            const { status } = req.body;
            const allowed = ['ASSIGNED', 'CONFIRMED', 'DECLINED'];
            if (!allowed.includes(status)) return res.status(400).json({ error: `Invalid status: ${status}` });
            const { data, error } = await supabase
                .from('invigilator_assignments')
                .update({ status })
                .eq('id', id).eq('school_id', schoolId)
                .select().single();
            if (error) throw error;
            return res.status(200).json(data);
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    }

    static async remove(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const { id } = req.params;
            const { error } = await supabase.from('invigilator_assignments').delete().eq('id', id).eq('school_id', schoolId);
            if (error) throw error;
            return res.status(200).json({ message: 'Assignment removed.' });
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    }

    static async listAvailability(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const { date } = req.query;
            let query = supabase
                .from('invigilator_availability')
                .select('*, faculty_profiles(id, users(id, first_name, last_name, email))')
                .eq('school_id', schoolId);
            if (date) query = query.eq('available_date', date as string);
            const { data, error } = await query;
            if (error) throw error;
            return res.status(200).json(data);
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    }

    static async setAvailability(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const { faculty_profile_id, available_date, start_time, end_time, is_available } = req.body;
            if (!faculty_profile_id || !available_date || !start_time || !end_time) {
                return res.status(400).json({ error: 'faculty_profile_id, available_date, start_time, end_time required.' });
            }
            const { data, error } = await supabase
                .from('invigilator_availability')
                .upsert({ school_id: schoolId, faculty_profile_id, available_date, start_time, end_time, is_available: is_available !== false }, { onConflict: 'faculty_profile_id,available_date,start_time' })
                .select().single();
            if (error) throw error;
            return res.status(200).json(data);
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    }
}
