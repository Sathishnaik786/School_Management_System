import { Request, Response } from 'express';
import { supabase } from '../../../config/supabase';

export class VenueController {

    // ───── CENTERS ─────
    static async listCenters(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const { data, error } = await supabase
                .from('exam_centers')
                .select('*, exam_buildings(id, name, exam_rooms(id, room_number, capacity))')
                .eq('school_id', schoolId)
                .order('name');
            if (error) throw error;
            return res.status(200).json(data);
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    }

    static async createCenter(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const { name, campus, code } = req.body;
            if (!name || !code) return res.status(400).json({ error: 'name and code are required.' });
            const { data, error } = await supabase
                .from('exam_centers')
                .insert({ school_id: schoolId, name, campus, code })
                .select().single();
            if (error) throw error;
            return res.status(201).json(data);
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    }

    static async updateCenter(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const { id } = req.params;
            const { data, error } = await supabase
                .from('exam_centers')
                .update({ ...req.body, updated_at: new Date().toISOString() })
                .eq('id', id).eq('school_id', schoolId)
                .select().single();
            if (error) throw error;
            return res.status(200).json(data);
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    }

    static async deleteCenter(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const { id } = req.params;
            const { error } = await supabase
                .from('exam_centers').delete().eq('id', id).eq('school_id', schoolId);
            if (error) throw error;
            return res.status(200).json({ message: 'Center deleted.' });
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    }

    // ───── BUILDINGS ─────
    static async listBuildings(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const { center_id } = req.query;
            let query = supabase.from('exam_buildings').select('*, exam_rooms(*)').eq('school_id', schoolId);
            if (center_id) query = query.eq('center_id', center_id as string);
            const { data, error } = await query.order('name');
            if (error) throw error;
            return res.status(200).json(data);
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    }

    static async createBuilding(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const { center_id, name, floors_count } = req.body;
            if (!center_id || !name) return res.status(400).json({ error: 'center_id and name are required.' });
            const { data, error } = await supabase
                .from('exam_buildings')
                .insert({ school_id: schoolId, center_id, name, floors_count: floors_count || 1 })
                .select().single();
            if (error) throw error;
            return res.status(201).json(data);
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    }

    static async updateBuilding(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const { id } = req.params;
            const { data, error } = await supabase
                .from('exam_buildings')
                .update({ ...req.body, updated_at: new Date().toISOString() })
                .eq('id', id).eq('school_id', schoolId)
                .select().single();
            if (error) throw error;
            return res.status(200).json(data);
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    }

    // ───── ROOMS ─────
    static async listRooms(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const { building_id } = req.query;
            let query = supabase.from('exam_rooms').select('*, exam_buildings(id, name, center_id)').eq('school_id', schoolId);
            if (building_id) query = query.eq('building_id', building_id as string);
            const { data, error } = await query.order('room_number');
            if (error) throw error;
            return res.status(200).json(data);
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    }

    static async createRoom(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const { building_id, room_number, capacity, floor_number, rows_count, cols_count, accessibility_supported } = req.body;
            if (!building_id || !room_number || !capacity) return res.status(400).json({ error: 'building_id, room_number, capacity required.' });
            const { data, error } = await supabase
                .from('exam_rooms')
                .insert({ school_id: schoolId, building_id, room_number, capacity, floor_number: floor_number || 0, rows_count: rows_count || 5, cols_count: cols_count || 5, accessibility_supported: accessibility_supported || false })
                .select().single();
            if (error) throw error;
            return res.status(201).json(data);
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    }

    static async updateRoom(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const { id } = req.params;
            const { data, error } = await supabase
                .from('exam_rooms')
                .update({ ...req.body, updated_at: new Date().toISOString() })
                .eq('id', id).eq('school_id', schoolId)
                .select().single();
            if (error) throw error;
            return res.status(200).json(data);
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    }

    static async deleteRoom(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const { id } = req.params;
            const { error } = await supabase.from('exam_rooms').delete().eq('id', id).eq('school_id', schoolId);
            if (error) throw error;
            return res.status(200).json({ message: 'Room deleted.' });
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    }
}
