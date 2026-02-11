import { Request, Response } from 'express';
import { supabase } from '../../../config/supabase';
import { ExamEligibilityService } from '../services/examEligibility.service';
import { ResultPublishService } from '../services/resultPublish.service';

export const ExamDeliverablesController = {
    // ------------------------------------------
    // HALL TICKET
    // ------------------------------------------
    async getHallTicket(req: Request, res: Response) {
        try {
            const { examId, studentId } = req.query;

            if (!examId || !studentId) return res.status(400).json({ error: "Missing examId or studentId" });

            // 1. Fetch Exam & Student Info First (to be safe)
            const { data: exam } = await supabase.from('exams').select('*').eq('id', examId).single();
            const { data: student } = await supabase.from('students').select('*').eq('id', studentId).single();

            if (!exam) return res.status(404).json({ error: "Exam not found" });

            // --- PHASE-4 GATE: ELIGIBILITY MUST BE FROZEN ---
            if (!exam.eligibility_frozen) {
                return res.status(403).json({
                    error: "Hall Ticket Not Ready: Exam eligibility has not been frozen yet.",
                    code: "UNFROZEN"
                });
            }
            // -----------------------------------------------

            // 2. Check Eligibility (Will use Snapshot because frozen=true)
            const eligibility = await ExamEligibilityService.checkEligibility(studentId as string, examId as string);

            if (!eligibility.eligible) {
                return res.status(403).json({
                    error: "Hall Ticket Denied: Student is not eligible.",
                    reasons: eligibility.reasons
                });
            }

            // PHASE-R2 FIX: Fetch Student Section for this Exam Year (Historical Correctness)
            const { data: sectionData } = await supabase
                .from('student_sections')
                .select('section:section_id(name, class:class_id(name))')
                .eq('student_id', studentId)
                .eq('academic_year_id', exam.academic_year_id)
                .maybeSingle();

            // 3. Fetch Schedule & Seating
            const { data: schedules } = await supabase
                .from('exam_schedules')
                .select(`
                    id, exam_date, start_time, end_time,
                    subject:subject_id(name, code)
                `)
                .eq('exam_id', examId)
                .order('exam_date', { ascending: true })
                .order('start_time', { ascending: true });

            if (!schedules || schedules.length === 0) {
                return res.status(404).json({ error: "No schedules found for this exam." });
            }

            // Fetch Seating for these schedules
            const scheduleIds = schedules.map(s => s.id);
            const { data: allocations } = await supabase
                .from('exam_seating_allocations')
                .select('exam_schedule_id, seat_number, hall:hall_id(hall_name, location)')
                .in('exam_schedule_id', scheduleIds)
                .eq('student_id', studentId);

            // Map seating to schedules
            const scheduleWithSeat = schedules.map(sch => {
                const alloc = allocations?.find(a => a.exam_schedule_id === sch.id);
                return {
                    ...sch,
                    hall: alloc?.hall,
                    seat_number: alloc?.seat_number,
                    is_seated: !!alloc
                };
            });

            if (!allocations || allocations.length === 0) {
                return res.status(403).json({
                    error: "Hall Ticket Not Ready: Seating allocation pending.",
                    code: "NOT_SEATED"
                });
            }

            res.json({
                generated_at: new Date().toISOString(),
                student: { ...student, section: (sectionData as any)?.section },
                exam,
                schedules: scheduleWithSeat,
                instructions: [
                    "Bring this hall ticket to the exam hall.",
                    "Report 15 minutes before exam start time.",
                    "No electronic gadgets allowed."
                ]
            });

        } catch (err: any) {
            console.error("Hall Ticket Error:", err);
            res.status(500).json({ error: err.message });
        }
    },

    // ------------------------------------------
    // REPORT CARD
    // ------------------------------------------
    async getReportCard(req: Request, res: Response) {
        try {
            const { examId, studentId } = req.query;

            if (!examId || !studentId) return res.status(400).json({ error: "Missing examId or studentId" });

            // 1. Check Published Status (For Student View)
            const isPublished = await ResultPublishService.isStudentResultPublished(examId as string, studentId as string);

            if (!isPublished) {
                return res.status(403).json({ error: "Report Card is not yet published." });
            }

            // 2. Fetch Summary
            const { data: summary } = await supabase
                .from('student_result_summaries')
                .select('*')
                .eq('exam_id', examId)
                .eq('student_id', studentId)
                .single();

            // 3. Fetch Details
            const { data: details } = await supabase
                .from('marks')
                .select(`
                    marks_obtained,
                    subject:subject_id(name, code)
                `)
                .eq('exam_id', examId)
                .eq('student_id', studentId);

            // 4. Fetch Exam & Student Info
            const { data: exam } = await supabase
                .from('exams')
                .select('*, academic_year:academic_year_id(year_label, status)')
                .eq('id', examId)
                .single();
            const { data: student } = await supabase.from('students').select('*').eq('id', studentId).single();

            // PHASE-R2 FIX: Historical Section
            const { data: sectionData } = await supabase
                .from('student_sections')
                .select('section:section_id(name, class:class_id(name))')
                .eq('student_id', studentId)
                .eq('academic_year_id', exam?.academic_year_id)
                .maybeSingle();

            res.json({
                published_at: summary.published_at,
                exam,
                student: { ...student, section: (sectionData as any)?.section },
                summary,
                details
            });

        } catch (err: any) {
            console.error("Report Card Error:", err);
            res.status(500).json({ error: err.message });
        }
    }
};
