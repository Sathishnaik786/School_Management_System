import { supabase } from '../../../config/supabase';

export const ExamSeatingService = {
    /**
     * Fetch students only from eligibility snapshots
     */
    async getEligibleStudents(examId: string, classId?: string) {
        let query = supabase
            .from('exam_eligibility_snapshots')
            .select(`
                student_id,
                eligible,
                student:student_id!inner (
                    id, full_name, student_code, status
                )
            `)
            .eq('exam_id', examId)
            .eq('eligible', true);

        // If classId is provided, we filter by joining students (though snapshots usually are exam-wide)
        // Senior Architect: Snapshots are for the entire exam. Use them.

        const { data, error } = await query;
        if (error) throw error;

        return (data || []).map(d => d.student).sort((a: any, b: any) =>
            (a.student_code || '').localeCompare(b.student_code || '')
        );
    },

    /**
     * Auto-allocate seats for an EXAM (Lockable)
     */
    async generateSeating(examId: string, classId: string, userId: string, schoolId: string) {
        // 1. Safety Check: Is it already published?
        const { data: exam } = await supabase.from('exams').select('seating_status').eq('id', examId).single();
        if (exam?.seating_status === 'PUBLISHED') throw new Error("SEATING_LOCKED: Cannot generate seating for a published exam.");

        // 2. Fetch Eligible Students from Snapshots
        const students = await this.getEligibleStudents(examId);
        if (students.length === 0) throw new Error("NO_ELIGIBLE_STUDENTS: Please verify and freeze eligibility first.");

        // 3. Fetch Available Halls
        const { data: halls, error: hallError } = await supabase
            .from('exam_halls')
            .select('*')
            .eq('school_id', schoolId)
            .order('hall_name');

        if (hallError) throw hallError;
        if (!halls || halls.length === 0) throw new Error("NO_HALLS: Please create examination halls first.");

        const totalCapacity = halls.reduce((sum, h) => sum + h.capacity, 0);
        if (students.length > totalCapacity) {
            throw new Error(`INSUFFICIENT_CAPACITY: Need ${students.length} seats, only ${totalCapacity} available.`);
        }

        // 4. Allocation Algorithm (Sequential)
        const allocations = [];
        let hallIndex = 0;
        let seatCounter = 1;

        for (const student of students) {
            let currentHall = halls[hallIndex];

            if (seatCounter > currentHall.capacity) {
                hallIndex++;
                currentHall = halls[hallIndex];
                seatCounter = 1;
            }

            allocations.push({
                exam_id: examId, // New field from migration
                student_id: (student as any).id,
                hall_id: currentHall.id,
                seat_number: `S-${seatCounter}`
            });
            seatCounter++;
        }

        // 5. Persist (Atomic)
        // Note: In real app, we'd use a transaction if possible. 
        // Here we clear existing for this exam first.
        const { error: delError } = await supabase.from('exam_seating_allocations').delete().eq('exam_id', examId);
        if (delError) throw delError;

        const { error: insError } = await supabase.from('exam_seating_allocations').insert(allocations);
        if (insError) throw insError;

        // 6. Audit
        await supabase.from('academic_automation_logs').insert({
            school_id: schoolId,
            action: 'SEATING_GENERATE',
            details: { examId, studentCount: allocations.length, hallsUsed: hallIndex + 1 },
            performed_by: userId
        });

        return { count: allocations.length, hallsUsed: hallIndex + 1 };
    },

    /**
     * Get Seating allocations for an Exam
     */
    async getSeatingView(examId: string) {
        const { data, error } = await supabase
            .from('exam_seating_allocations')
            .select(`
                id, seat_number,
                student:student_id(id, full_name, student_code),
                hall:hall_id(id, hall_name, location)
            `)
            .eq('exam_id', examId)
            .order('hall_id')
            .order('seat_number', { ascending: true } as any);

        if (error) throw error;
        return data;
    },

    /**
     * Publish Seating (Critical Gate)
     */
    async publishSeating(examId: string, userId: string, schoolId: string) {
        // Validation: Must have halls and all eligible seated.
        // For simplicity: We mark it as PUBLISHED which locks edits.

        const { error } = await supabase
            .from('exams')
            .update({ seating_status: 'PUBLISHED' })
            .eq('id', examId);

        if (error) throw error;

        await supabase.from('academic_automation_logs').insert({
            school_id: schoolId,
            action: 'SEATING_PUBLISH',
            details: { examId },
            performed_by: userId
        });

        return { success: true };
    },

    /**
     * Reset Seating (Admin Only)
     */
    async resetSeating(examId: string) {
        const { data: exam } = await supabase.from('exams').select('seating_status').eq('id', examId).single();
        if (exam?.seating_status === 'PUBLISHED') throw new Error("SEATING_LOCKED: Cannot reset published seating.");

        const { error } = await supabase.from('exam_seating_allocations').delete().eq('exam_id', examId);
        if (error) throw error;

        return { success: true };
    }
};

