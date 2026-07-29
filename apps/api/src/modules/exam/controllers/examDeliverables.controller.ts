import { Request, Response } from 'express';
import { supabase } from '../../../config/supabase';
import { ExamEligibilityService } from '../services/examEligibility.service';
import { ResultPublishService } from '../services/resultPublish.service';
import { ExamReportCardService } from '../services/ExamReportCard.service';
import { ExamProgressReportService } from '../services/ExamProgressReport.service';

export const ExamDeliverablesController = {
    // ------------------------------------------
    // HALL TICKET
    // ------------------------------------------
    async getHallTicket(req: Request, res: Response) {
        try {
            const { examId, studentId } = req.query;
            if (!examId || !studentId) return res.status(400).json({ error: "Missing examId or studentId" });

            const { data: exam } = await supabase.from('exams').select('*').eq('id', examId).single();
            if (!exam) return res.status(404).json({ error: "Exam not found" });

            if (!exam.eligibility_frozen) {
                return res.status(403).json({ error: "Hall Ticket Not Ready: Exam eligibility has not been frozen.", code: "UNFROZEN" });
            }

            const eligibility = await ExamEligibilityService.checkEligibility(studentId as string, examId as string);
            if (!eligibility.eligible) {
                return res.status(403).json({ error: "Hall Ticket Denied: Student is not eligible.", reasons: eligibility.reasons });
            }

            const { data: sectionData } = await supabase.from('student_sections').select('section:section_id(name, class:class_id(name))').eq('student_id', studentId).eq('academic_year_id', exam.academic_year_id).maybeSingle();

            const { data: schedules } = await supabase.from('exam_schedules').select(`id, exam_date, start_time, end_time, subject:subject_id(name, code)`).eq('exam_id', examId).order('exam_date', { ascending: true });

            const scheduleIds = schedules?.map(s => s.id) || [];
            const { data: allocations } = await supabase.from('exam_seating_allocations').select('exam_schedule_id, seat_number, hall:hall_id(hall_name, location)').in('exam_schedule_id', scheduleIds).eq('student_id', studentId);

            res.json({
                generated_at: new Date().toISOString(),
                student: { id: studentId, section: (sectionData as any)?.section },
                exam,
                schedules: schedules?.map(sch => {
                    const alloc = allocations?.find(a => a.exam_schedule_id === sch.id);
                    return { ...sch, hall: alloc?.hall, seat_number: alloc?.seat_number, is_seated: !!alloc };
                })
            });
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    },

    // ------------------------------------------
    // PDF REPORT CARD (PHASE 17)
    // ------------------------------------------
    async generateStudentPDF(req: Request, res: Response) {
        try {
            const { examId, studentId } = req.params;
            const schoolId = req.context!.user.school_id;
            const pdfBuffer = await ExamReportCardService.generateStudentPDF(examId, studentId, schoolId);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=ReportCard_${studentId}.pdf`);
            res.send(pdfBuffer);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    },

    async bulkDownloadResults(req: Request, res: Response) {
        try {
            const { examId } = req.params;
            const schoolId = req.context!.user.school_id;
            const zipBuffer = await ExamReportCardService.bulkDownloadZIP(examId, schoolId);
            res.setHeader('Content-Type', 'application/zip');
            res.setHeader('Content-Disposition', `attachment; filename=Results_Exam_${examId}.zip`);
            res.send(zipBuffer);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    },

    // ------------------------------------------
    // PROGRESS REPORT (PHASE 18)
    // ------------------------------------------
    async generateProgressReportPDF(req: Request, res: Response) {
        try {
            const { examId, studentId } = req.params;
            const schoolId = req.context!.user.school_id;
            const pdfBuffer = await ExamProgressReportService.generateProgressReportPDF(examId, studentId, schoolId);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=ProgressReport_${studentId}.pdf`);
            res.send(pdfBuffer);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    },

    async bulkDownloadProgressReports(req: Request, res: Response) {
        try {
            const { examId } = req.params;
            const schoolId = req.context!.user.school_id;
            const zipBuffer = await ExamProgressReportService.bulkDownloadZIP(examId, schoolId);
            res.setHeader('Content-Type', 'application/zip');
            res.setHeader('Content-Disposition', `attachment; filename=ProgressReports_Exam_${examId}.zip`);
            res.send(zipBuffer);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    }
};
