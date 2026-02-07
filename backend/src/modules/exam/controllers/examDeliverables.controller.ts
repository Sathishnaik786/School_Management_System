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

            // 1. Check Eligibility
            const eligibility = await ExamEligibilityService.checkEligibility(studentId as string, examId as string);

            if (!eligibility.eligible) {
                return res.status(403).json({
                    error: "Hall Ticket Denied: Student is not eligible.",
                    reasons: eligibility.reasons
                });
            }

            // 2. Fetch Exam Info
            const { data: exam } = await supabase.from('exams').select('*').eq('id', examId).single();
            const { data: student } = await supabase.from('students').select('*').eq('id', studentId).single();

            // 3. Fetch Schedule
            const { data: schedule } = await supabase
                .from('exam_schedules')
                .select(`
                    id, exam_date, start_time, end_time,
                    subject:subject_id(name, code)
                `)
                .eq('exam_id', examId)
                .order('exam_date', { ascending: true })
                .order('start_time', { ascending: true });

            res.json({
                generated_at: new Date().toISOString(),
                student,
                exam,
                schedule,
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
            // If admin is requesting, maybe allow preview? Task says "OFFICIAL", implies Student View.
            // We enforce strict published rule.
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
            const { data: exam } = await supabase.from('exams').select('*').eq('id', examId).single();
            const { data: student } = await supabase.from('students').select('*').eq('id', studentId).single();

            res.json({
                published_at: summary.published_at,
                exam,
                student,
                summary,
                details
            });

        } catch (err: any) {
            console.error("Report Card Error:", err);
            res.status(500).json({ error: err.message });
        }
    }
};
