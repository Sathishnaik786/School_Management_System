import { supabase } from '../../../config/supabase';

export const ExamEligibilityService = {
    async checkEligibility(studentId: string, examId: string): Promise<{
        eligible: boolean;
        attendance_percentage: number;
        fees_status: 'CLEARED' | 'PENDING';
        reasons: string[];
    }> {
        const reasons: string[] = [];
        let eligible = true;

        // 1. Get Exam Context (Academic Year)
        const { data: exam, error: examError } = await supabase
            .from('exams')
            .select('academic_year_id')
            .eq('id', examId)
            .single();

        if (examError || !exam) {
            throw new Error("Exam not found");
        }

        // 2. Check Attendance
        // Strategy: Count attendance_records for this student in the exam's academic year.
        // We join sessions to filter by academic_year_id.
        const { data: records, error: attError } = await supabase
            .from('attendance_records')
            .select(`
                status,
                session:session_id!inner(academic_year_id)
            `)
            .eq('student_id', studentId)
            .eq('session.academic_year_id', exam.academic_year_id);

        if (attError) throw attError;

        let totalSessions = 0;
        let attendedSessions = 0;
        let attendancePercentage = 100; // Default to 100 if no sessions (benefit of doubt)

        if (records && records.length > 0) {
            totalSessions = records.length;
            // Count Present, Late, Excused as "Attended"
            attendedSessions = records.filter((r: any) =>
                ['present', 'late', 'excused'].includes(r.status?.toLowerCase())
            ).length;

            attendancePercentage = (attendedSessions / totalSessions) * 100;
        }

        if (attendancePercentage < 75) {
            eligible = false;
            reasons.push(`Low Attendance: ${attendancePercentage.toFixed(1)}% (Required: 75%)`);
        }

        // 3. Check Fees
        // Strategy: Sum assigned fees vs payments for this student
        // Note: Ideally filter by academic year too, but fees often carry over. 
        // For strict Phase-2 per requirements, we check overall or current year. 
        // Existing fees.routes.ts logic uses ALL fees/payments for the student. We follow that.

        const { data: feeAssignments, error: feeError } = await supabase
            .from('student_fees')
            .select('assigned_amount')
            .eq('student_id', studentId);

        const { data: payments, error: payError } = await supabase
            .from('payments')
            .select('amount_paid')
            .eq('student_id', studentId);

        if (feeError) throw feeError;
        if (payError) throw payError;

        const totalAssigned = feeAssignments?.reduce((sum, f) => sum + Number(f.assigned_amount), 0) || 0;
        const totalPaid = payments?.reduce((sum, p) => sum + Number(p.amount_paid), 0) || 0;
        const balance = totalAssigned - totalPaid;

        // Allow small float discrepancy
        const isFeeCleared = balance <= 1;

        if (!isFeeCleared) {
            eligible = false;
            reasons.push(`Pending Fees: ${balance.toFixed(2)} remaining`);
        }

        return {
            eligible,
            attendance_percentage: parseFloat(attendancePercentage.toFixed(1)),
            fees_status: isFeeCleared ? 'CLEARED' : 'PENDING',
            reasons
        };
    }
};
