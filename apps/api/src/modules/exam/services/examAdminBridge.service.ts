import { supabase } from '../../../config/supabase';

export const ExamAdminBridgeService = {
    /**
     * Set authoritative attendance for a student (Admin Override)
     * Upserts into student_attendance_cache with source = 'ADMIN'
     */
    async setAttendance(payload: {
        studentId: string;
        academicYearId: string;
        percentage: number;
        userId: string;
        term?: string;
    }) {
        // Validation (0-100)
        if (payload.percentage < 0 || payload.percentage > 100) {
            throw new Error("Attendance percentage must be between 0 and 100");
        }

        // Logic: specific total days = 100, present days = percentage
        // This ensures the GENERATED ALWAYS AS matches the desired percentage
        const total_working_days = 100;
        const present_days = Math.round(payload.percentage);

        const { error } = await supabase
            .from('student_attendance_cache')
            .upsert({
                student_id: payload.studentId,
                academic_year_id: payload.academicYearId,
                term: payload.term || 'ANNUAL',
                total_working_days,
                present_days,
                source: 'ADMIN',
                last_updated_by: payload.userId,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'student_id, academic_year_id, term'
            });

        if (error) throw error;
        return { success: true };
    },

    /**
     * Set authoritative fee status for a student (Admin Override)
     * Upserts into student_fee_clearance_cache with source = 'ADMIN'
     */
    async setFeeStatus(payload: {
        studentId: string;
        academicYearId: string;
        status: 'PAID' | 'PARTIAL' | 'UNPAID';
        userId: string;
        term?: string;
        remarks?: string;
    }) {
        const is_cleared = payload.status === 'PAID';

        const { error } = await supabase
            .from('student_fee_clearance_cache')
            .upsert({
                student_id: payload.studentId,
                academic_year_id: payload.academicYearId,
                term: payload.term || 'ANNUAL',
                fee_status: payload.status,
                is_cleared,
                source: 'ADMIN',
                last_updated_by: payload.userId,
                remarks: payload.remarks,
                last_checked_at: new Date().toISOString()
            }, {
                onConflict: 'student_id, academic_year_id, term'
            });

        if (error) throw error;
        return { success: true };
    },

    /**
     * Get bridge data for a class (Students + Cache Status)
     */
    async getClassBridgeData(classId: string, academicYearId: string) {
        // 1. Get Sections for the Class
        const { data: sections, error: secError } = await supabase
            .from('sections')
            .select('id')
            .eq('class_id', classId);

        if (secError) throw secError;

        const sectionIds = sections?.map(s => s.id) || [];
        if (sectionIds.length === 0) return [];

        // 2. Get Students in those sections
        const { data: enrollments, error: enrollError } = await supabase
            .from('student_sections')
            .select(`
                student:student_id(id, full_name, student_code)
            `)
            .in('section_id', sectionIds);

        if (enrollError) throw enrollError;

        const studentList = enrollments?.map((e: any) => e.student).filter((s: any) => s) || [];
        const studentIds = studentList.map((s: any) => s.id);

        if (studentIds.length === 0) return [];

        // 3. Fetch Caches
        const { data: attCache } = await supabase
            .from('student_attendance_cache')
            .select('student_id, attendance_percentage, source')
            .eq('academic_year_id', academicYearId)
            .in('student_id', studentIds);

        const { data: feeCache } = await supabase
            .from('student_fee_clearance_cache')
            .select('student_id, fee_status, source, is_cleared')
            .eq('academic_year_id', academicYearId)
            .in('student_id', studentIds);

        // 3. Map Results
        const attMap = new Map(attCache?.map(a => [a.student_id, a]));
        const feeMap = new Map(feeCache?.map(f => [f.student_id, f]));

        return studentList.map((s: any) => ({
            ...s,
            attendance: attMap.get(s.id) || null,
            fees: feeMap.get(s.id) || null
        }));
    }
};
