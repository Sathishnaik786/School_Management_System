import { Request, Response } from 'express';
import { supabase } from '../../../config/supabase';

export class SeatingController {

    static async listAllocations(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const { exam_schedule_id } = req.query;
            let query = supabase
                .from('seat_allocations')
                .select('*, students(id, first_name, last_name, roll_number), exam_rooms(id, room_number, exam_buildings(name)), exam_schedules(id, exam_date, subject_name)')
                .eq('school_id', schoolId);
            if (exam_schedule_id) query = query.eq('exam_schedule_id', exam_schedule_id as string);
            const { data, error } = await query.order('seat_number');
            if (error) throw error;
            return res.status(200).json(data);
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    }

    static async autoAllocate(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            const { exam_schedule_id, room_ids } = req.body;
            if (!exam_schedule_id || !room_ids?.length) return res.status(400).json({ error: 'exam_schedule_id and room_ids required.' });

            // Fetch registrations that are APPROVED for this exam schedule's exam
            const { data: schedule } = await supabase
                .from('exam_schedules').select('exam_id').eq('id', exam_schedule_id).single();
            if (!schedule) return res.status(404).json({ error: 'Schedule not found.' });

            const { data: registrations } = await supabase
                .from('exam_registrations')
                .select('id, student_id')
                .eq('exam_id', schedule.exam_id)
                .eq('school_id', schoolId)
                .in('status', ['APPROVED', 'HALL_TICKET_GENERATED']);

            if (!registrations?.length) return res.status(400).json({ error: 'No approved registrations found.' });

            // Fetch rooms and their capacities
            const { data: rooms } = await supabase
                .from('exam_rooms').select('id, capacity').in('id', room_ids).eq('school_id', schoolId);
            if (!rooms?.length) return res.status(400).json({ error: 'No valid rooms found.' });

            const allocations: any[] = [];
            let roomIndex = 0;
            let seatCounter = 1;

            for (const reg of registrations) {
                if (roomIndex >= rooms.length) break;
                const room = rooms[roomIndex];
                allocations.push({
                    school_id: schoolId,
                    exam_schedule_id,
                    student_id: reg.student_id,
                    room_id: room.id,
                    seat_number: `${room.id.slice(-4).toUpperCase()}-${String(seatCounter).padStart(3, '0')}`,
                    status: 'ALLOCATED'
                });
                seatCounter++;
                if (seatCounter > room.capacity) {
                    roomIndex++;
                    seatCounter = 1;
                }
            }

            const { data: inserted, error } = await supabase
                .from('seat_allocations').insert(allocations).select();
            if (error) throw error;

            // Audit log
            const auditLogs = (inserted || []).map((a: any) => ({
                school_id: schoolId, allocation_id: a.id, action: 'CREATE', new_seat: a.seat_number, performed_by: userId
            }));
            if (auditLogs.length > 0) {
                await supabase.from('seat_allocation_audit_logs').insert(auditLogs);
            }

            return res.status(201).json({ allocated: inserted?.length || 0, data: inserted });
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    }

    static async changeSeat(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            const { id } = req.params;
            const { new_seat_number, new_room_id, remarks } = req.body;

            const { data: existing } = await supabase
                .from('seat_allocations').select('*').eq('id', id).eq('school_id', schoolId).single();
            if (!existing) return res.status(404).json({ error: 'Allocation not found.' });

            const { data, error } = await supabase
                .from('seat_allocations')
                .update({ seat_number: new_seat_number, room_id: new_room_id || existing.room_id, status: 'CHANGED', updated_at: new Date().toISOString() })
                .eq('id', id).select().single();
            if (error) throw error;

            await supabase.from('seat_allocation_audit_logs').insert({
                school_id: schoolId, allocation_id: id, action: 'CHANGE',
                old_seat: existing.seat_number, new_seat: new_seat_number, performed_by: userId, remarks
            });

            return res.status(200).json(data);
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    }

    static async getAuditLogs(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const { allocation_id } = req.query;
            let query = supabase
                .from('seat_allocation_audit_logs')
                .select('*, users(id, email)')
                .eq('school_id', schoolId)
                .order('created_at', { ascending: false });
            if (allocation_id) query = query.eq('allocation_id', allocation_id as string);
            const { data, error } = await query;
            if (error) throw error;
            return res.status(200).json(data);
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    }
}
