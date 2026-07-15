import { Request, Response } from 'express';
import { supabase } from '../../../config/supabase';

export class AttendanceController {

    static async listAttendance(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const { exam_schedule_id } = req.query;
            if (!exam_schedule_id) return res.status(400).json({ error: 'exam_schedule_id required.' });
            const { data, error } = await supabase
                .from('exam_attendance')
                .select('*, students(id, first_name, last_name, roll_number)')
                .eq('exam_schedule_id', exam_schedule_id as string)
                .order('created_at');
            if (error) throw error;
            return res.status(200).json(data);
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    }

    static async markAttendance(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            const { exam_schedule_id, student_id, status, verified_via, remarks } = req.body;
            if (!exam_schedule_id || !student_id || !status) {
                return res.status(400).json({ error: 'exam_schedule_id, student_id, status required.' });
            }
            const allowed = ['REGISTERED', 'CHECKED_IN', 'PRESENT', 'LATE', 'ABSENT', 'MALPRACTICE', 'CANCELLED'];
            if (!allowed.includes(status)) return res.status(400).json({ error: `Invalid status: ${status}` });

            const { data, error } = await supabase
                .from('exam_attendance')
                .upsert({
                    school_id: schoolId, exam_schedule_id, student_id, status,
                    entry_time: ['CHECKED_IN', 'PRESENT', 'LATE'].includes(status) ? new Date().toISOString() : null,
                    verified_via: verified_via || 'MANUAL',
                    remarks, updated_at: new Date().toISOString()
                }, { onConflict: 'exam_schedule_id,student_id' })
                .select().single();
            if (error) throw error;

            await supabase.from('attendance_logs').insert({
                school_id: schoolId, attendance_id: data.id,
                action: `MARKED_${status}`, details: { status, verified_via }, performed_by: userId
            });

            return res.status(200).json(data);
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    }

    static async scanQR(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            const { ticket_code, exam_schedule_id } = req.body;
            if (!ticket_code || !exam_schedule_id) {
                return res.status(400).json({ error: 'ticket_code and exam_schedule_id required.' });
            }

            // Resolve ticket → registration → student
            const { data: ticket } = await supabase
                .from('hall_tickets')
                .select('*, exam_registrations(id, student_id, exam_id, status)')
                .eq('ticket_code', ticket_code)
                .eq('school_id', schoolId)
                .single();

            if (!ticket) return res.status(404).json({ error: 'Hall ticket not found.' });
            if (ticket.status === 'REVOKED') return res.status(403).json({ error: 'Hall ticket is revoked.' });
            const reg = ticket.exam_registrations as any;
            if (!reg) return res.status(400).json({ error: 'Registration not associated with ticket.' });

            // Mark attendance as CHECKED_IN via QR
            const { data: attendance, error } = await supabase
                .from('exam_attendance')
                .upsert({
                    school_id: schoolId, exam_schedule_id, student_id: reg.student_id,
                    status: 'CHECKED_IN', entry_time: new Date().toISOString(),
                    verified_via: 'QR_CODE', updated_at: new Date().toISOString()
                }, { onConflict: 'exam_schedule_id,student_id' })
                .select().single();
            if (error) throw error;

            // Log QR scan
            await supabase.from('hall_ticket_logs').insert({
                school_id: schoolId, hall_ticket_id: ticket.id, action: 'QR_SCAN', performed_by: userId
            });

            return res.status(200).json({ message: 'Check-in successful via QR.', attendance });
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    }

    static async bulkMark(req: Request, res: Response): Promise<Response> {
        try {
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            const { exam_schedule_id, entries } = req.body;
            // entries: Array<{ student_id, status }>
            if (!exam_schedule_id || !entries?.length) {
                return res.status(400).json({ error: 'exam_schedule_id and entries required.' });
            }
            const rows = (entries as any[]).map(e => ({
                school_id: schoolId, exam_schedule_id, student_id: e.student_id,
                status: e.status, verified_via: 'MANUAL', updated_at: new Date().toISOString()
            }));
            const { data, error } = await supabase
                .from('exam_attendance')
                .upsert(rows, { onConflict: 'exam_schedule_id,student_id' })
                .select();
            if (error) throw error;
            return res.status(200).json({ updated: data?.length || 0, data });
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    }
}
