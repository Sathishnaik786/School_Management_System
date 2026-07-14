import { Request, Response } from 'express';
import { AttendanceValidator } from '../validators/AttendanceValidator';
import { supabase } from '../../../config/supabase';

export class LeaveManagementController {
    public static async submitLeave(req: Request, res: Response): Promise<Response> {
        try {
            const validated = AttendanceValidator.validateSubmitLeave(req.body);
            
            const { data, error } = await supabase
                .from('student_leave_requests')
                .insert({
                    student_id: validated.student_id,
                    start_date: validated.start_date,
                    end_date: validated.end_date,
                    leave_type: validated.leave_type,
                    reason: validated.reason,
                    status: 'PENDING'
                })
                .select()
                .single();

            if (error) throw error;
            return res.status(201).json(data);
        } catch (error: any) {
            return res.status(400).json({ error: error.message || 'Failed to submit leave request.' });
        }
    }

    public static async approveLeave(req: Request, res: Response): Promise<Response> {
        try {
            const { id, status } = req.body;
            
            const { data, error } = await supabase
                .from('student_leave_requests')
                .update({ status })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return res.status(200).json(data);
        } catch (error: any) {
            return res.status(400).json({ error: error.message || 'Failed to process leave approval.' });
        }
    }
}
export default LeaveManagementController;
