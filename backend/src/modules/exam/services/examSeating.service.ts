import { supabase } from '../../../config/supabase';
import { ExamEligibilityService } from './examEligibility.service';

export const ExamSeatingService = {
    async generateSeating(examScheduleId: string, userId: string, schoolId: string) {
        // 1. Fetch Exam Schedule Info
        const { data: schedule, error: schError } = await supabase
            .from('exam_schedules')
            .select('*, exam:exam_id(*), subject:subject_id(*), subject_class:subjects!inner(class_id)')
            .eq('id', examScheduleId)
            .single();

        if (schError || !schedule) throw new Error("Exam schedule not found");
        if (schedule.status !== 'SCHEDULED') throw new Error(`Cannot seat for exam status: ${schedule.status}`);

        // 2. Fetch Eligible Students (Only from the relevant Class)
        // Note: Students are in 'students' table with 'current_class_id' or assigned to section. 
        // We find students belonging to the subject's class.
        // Assuming subject is linked to class.
        const classId = schedule.subject_class?.class_id;
        if (!classId) throw new Error("Class not found for this subject");

        // Get All Students in Class
        // We link via sections usually. 
        // Simple path: students -> section -> class.
        // Or if students have assigned subjects? 
        // Let's use students in class via section.
        const { data: students, error: stuError } = await supabase
            .from('students')
            .select('id, full_name, student_code, section:section_id!inner(class_id)')
            .eq('section.class_id', classId)
            .eq('school_id', schoolId)
            .order('student_code', { ascending: true }); // Seat order by code

        if (stuError) throw stuError;
        if (!students || students.length === 0) throw new Error("No students found in this class");

        // Filter Eligible Students
        const eligibleStudents = [];
        for (const student of students) {
            const eligibility = await ExamEligibilityService.checkEligibility(student.id, schedule.exam_id);
            if (eligibility.eligible) {
                eligibleStudents.push(student);
            }
        }

        if (eligibleStudents.length === 0) throw new Error("No eligible students found for seating.");

        // 3. Fetch Halls
        const { data: halls, error: hallError } = await supabase
            .from('exam_halls')
            .select('*')
            .eq('school_id', schoolId)
            .order('hall_name');

        if (hallError) throw hallError;
        if (!halls || halls.length === 0) throw new Error("No exam halls defined.");

        // Check Capacity
        const totalCapacity = halls.reduce((sum, h) => sum + h.capacity, 0);
        if (eligibleStudents.length > totalCapacity) {
            throw new Error(`Insufficient capacity. Need ${eligibleStudents.length}, have ${totalCapacity}.`);
        }

        // 4. Allocation Logic
        const allocations = [];
        let hallIndex = 0;
        let seatCounter = 1;

        for (const student of eligibleStudents) {
            let currentHall = halls[hallIndex];

            // Move to next hall if full
            // Note: In real world, we might want to "fill" halls or distribute evenly. 
            // Simple logic: Fill sequentially.
            // Check seats allocated so far in this loop for the current hall is irrelevant since we start fresh? 
            // Yes, regenerate implies fresh start. 
            // But if we are running sequential loop, we track capacity.

            if (seatCounter > currentHall.capacity) {
                hallIndex++;
                if (hallIndex >= halls.length) {
                    throw new Error("Unexpected overflow during allocation"); // Should be caught by total check, but safety.
                }
                currentHall = halls[hallIndex];
                seatCounter = 1;
            }

            allocations.push({
                exam_schedule_id: examScheduleId,
                student_id: student.id,
                hall_id: currentHall.id,
                seat_number: `S-${seatCounter}` // Simple numbering
            });
            seatCounter++;
        }

        // 5. Atomic Replace (Transaction-like)
        // Delete existing for this schedule
        await supabase.from('exam_seating_allocations').delete().eq('exam_schedule_id', examScheduleId);

        // Insert new
        const { error: insertError } = await supabase.from('exam_seating_allocations').insert(allocations);
        if (insertError) throw insertError;

        // 6. Audit
        await supabase.from('exam_audit_logs').insert({
            entity_type: 'SEATING',
            entity_id: examScheduleId,
            action: 'GENERATE',
            performed_by: userId,
            reason: `Generated seating for ${allocations.length} eligible students across ${hallIndex + 1} halls.`
        });

        return { count: allocations.length, hallsUsed: hallIndex + 1 };
    },

    async getSeating(examScheduleId: string) {
        const { data, error } = await supabase
            .from('exam_seating_allocations')
            .select(`
                id, seat_number,
                student:student_id(full_name, student_code),
                hall:hall_id(hall_name, location)
            `)
            .eq('exam_schedule_id', examScheduleId)
            .order('hall_id')
            .order('seat_number', { ascending: true } as any); // Type cast if needed for complex order

        if (error) throw error;
        return data;
    }
};
