import { supabase } from '../../../config/supabase';

export const ExamHallTicketService = {
    /**
     * Generate Hall Tickets for all seated students of an exam (Idempotent)
     */
    async generateHallTickets(examId: string, userId: string, schoolId: string) {
        // 1. Check if Seating is Published
        const { data: exam } = await supabase.from('exams').select('*').eq('id', examId).single();
        if (exam?.seating_status !== 'PUBLISHED') {
            throw new Error("SEATING_NOT_PUBLISHED: Please publish seating allocation first.");
        }

        // 2. Fetch all seated students for this exam
        const { data: seated, error: seatError } = await supabase
            .from('exam_seating_allocations')
            .select(`
                id, seat_number,
                student:student_id(id, full_name, student_code),
                hall:hall_id(hall_name, location)
            `)
            .eq('exam_id', examId);

        if (seatError) throw seatError;
        if (!seated || seated.length === 0) throw new Error("NO_SEATING_FOUND: No students found in seating allocation.");

        // 3. Prepare Hall Ticket Records
        const tickets = seated.map(s => {
            const student = s.student as any;
            const hall = s.hall as any;

            return {
                student_id: student.id,
                exam_id: examId,
                hall_allocation_id: s.id,
                ticket_code: `HT-${examId.slice(0, 4)}-${student.student_code || student.id.slice(0, 6)}`.toUpperCase(),
                snapshot_data: {
                    student_name: student.full_name,
                    student_code: student.student_code,
                    hall_name: hall.hall_name,
                    seat_number: s.seat_number,
                    exam_name: exam.name,
                    generated_at: new Date().toISOString()
                }
            };
        });

        // 4. Batch Upsert (Idempotent)
        const { error: upsertError } = await supabase
            .from('exam_hall_tickets')
            .upsert(tickets, { onConflict: 'student_id,exam_id' });

        if (upsertError) throw upsertError;

        // 5. Audit
        await supabase.from('academic_automation_logs').insert({
            school_id: schoolId,
            action: 'HALL_TICKET_GENERATE',
            details: { examId, count: tickets.length },
            performed_by: userId
        });

        return { count: tickets.length };
    },

    /**
     * Get Hall Tickets for display
     */
    async getHallTickets(examId: string) {
        const { data, error } = await supabase
            .from('exam_hall_tickets')
            .select(`
                *,
                student:student_id(full_name, student_code)
            `)
            .eq('exam_id', examId)
            .order('generated_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    /**
     * Get a specific Hall Ticket (Student view)
     */
    async getStudentHallTicket(studentId: string, examId: string) {
        const { data, error } = await supabase
            .from('exam_hall_tickets')
            .select(`
                *,
                exam:exam_id(name, start_date, end_date),
                student:student_id(full_name, student_code)
            `)
            .eq('student_id', studentId)
            .eq('exam_id', examId)
            .single();

        if (error) return null;
        return data;
    }
};
