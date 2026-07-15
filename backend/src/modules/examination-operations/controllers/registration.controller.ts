import { Request, Response } from 'express';
import { supabase } from '../../../config/supabase';

export class RegistrationController {

    static async list(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            if (!schoolId) return res.status(400).json({ error: 'School context required.' });
            const { exam_id, status, page = 1, limit = 20 } = req.query;
            let query = supabase
                .from('exam_registrations')
                .select('*, students(id, first_name, last_name, roll_number, email), exams(id, name, code)', { count: 'exact' })
                .eq('school_id', schoolId)
                .order('created_at', { ascending: false })
                .range((+page - 1) * +limit, +page * +limit - 1);
            if (exam_id) query = query.eq('exam_id', exam_id as string);
            if (status) query = query.eq('status', status as string);
            const { data, error, count } = await query;
            if (error) throw error;
            return res.status(200).json({ data, total: count, page: +page, limit: +limit });
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    }

    static async get(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const { id } = req.params;
            const { data, error } = await supabase
                .from('exam_registrations')
                .select('*, students(*), exams(*), hall_tickets(*), registration_status_history(*), registration_documents(*)')
                .eq('id', id)
                .eq('school_id', schoolId)
                .single();
            if (error) throw error;
            if (!data) return res.status(404).json({ error: 'Registration not found.' });
            return res.status(200).json(data);
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    }

    static async create(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            const { student_id, exam_id } = req.body;
            if (!student_id || !exam_id) return res.status(400).json({ error: 'student_id and exam_id required.' });

            const { data, error } = await supabase
                .from('exam_registrations')
                .insert({ school_id: schoolId, student_id, exam_id, status: 'DRAFT' })
                .select()
                .single();
            if (error) throw error;

            // Log status history
            await supabase.from('registration_status_history').insert({
                school_id: schoolId, registration_id: data.id, status: 'DRAFT', changed_by: userId
            });
            return res.status(201).json(data);
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    }

    static async updateStatus(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            const { id } = req.params;
            const { status, remarks } = req.body;
            const allowed = ['DRAFT', 'PENDING', 'VERIFIED', 'APPROVED', 'HALL_TICKET_GENERATED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED'];
            if (!allowed.includes(status)) return res.status(400).json({ error: `Invalid status: ${status}` });

            const { data, error } = await supabase
                .from('exam_registrations')
                .update({ status, updated_at: new Date().toISOString() })
                .eq('id', id)
                .eq('school_id', schoolId)
                .select()
                .single();
            if (error) throw error;

            await supabase.from('registration_status_history').insert({
                school_id: schoolId, registration_id: id, status, changed_by: userId, remarks
            });
            return res.status(200).json(data);
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    }

    static async bulkRegister(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            const { student_ids, exam_id } = req.body;
            if (!student_ids?.length || !exam_id) return res.status(400).json({ error: 'student_ids and exam_id required.' });

            const rows = (student_ids as string[]).map(sid => ({
                school_id: schoolId, student_id: sid, exam_id, status: 'DRAFT'
            }));
            const { data, error } = await supabase.from('exam_registrations').insert(rows).select();
            if (error) throw error;

            // Bulk log status history
            const historyRows = (data || []).map((r: any) => ({
                school_id: schoolId, registration_id: r.id, status: 'DRAFT', changed_by: userId
            }));
            if (historyRows.length > 0) {
                await supabase.from('registration_status_history').insert(historyRows);
            }
            return res.status(201).json({ created: data?.length || 0, data });
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    }

    static async generateHallTicket(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            const { id } = req.params;

            // Verify registration is APPROVED
            const { data: reg, error: regErr } = await supabase
                .from('exam_registrations').select('*').eq('id', id).eq('school_id', schoolId).single();
            if (regErr || !reg) return res.status(404).json({ error: 'Registration not found.' });
            if (reg.status !== 'APPROVED') return res.status(400).json({ error: 'Registration must be APPROVED before generating a hall ticket.' });

            const ticketCode = `HT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
            const snapshotData = { registration: reg };

            const { data: ticket, error: ticketErr } = await supabase
                .from('hall_tickets')
                .insert({ school_id: schoolId, registration_id: id, ticket_code: ticketCode, status: 'GENERATED', snapshot_data: snapshotData })
                .select()
                .single();
            if (ticketErr) throw ticketErr;

            // Update registration status
            await supabase.from('exam_registrations').update({ status: 'HALL_TICKET_GENERATED' }).eq('id', id);
            await supabase.from('registration_status_history').insert({
                school_id: schoolId, registration_id: id, status: 'HALL_TICKET_GENERATED', changed_by: userId, remarks: `Hall ticket ${ticketCode} generated`
            });
            await supabase.from('hall_ticket_logs').insert({
                school_id: schoolId, hall_ticket_id: ticket.id, action: 'GENERATED', performed_by: userId
            });

            return res.status(201).json(ticket);
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    }
}
