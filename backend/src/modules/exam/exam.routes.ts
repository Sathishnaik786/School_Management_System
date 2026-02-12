import { Router } from 'express';
import { checkPermission } from '../../rbac/rbac.middleware';
import { PERMISSIONS } from '../../rbac/permissions';
import { supabase } from '../../config/supabase';
import { z } from 'zod';
import { ExamScheduleController } from './controllers/examSchedule.controller';
import { ExamEligibilityController } from './controllers/examEligibility.controller';
import { ExamEligibilityService } from './services/examEligibility.service';
import { ResultProcessorService } from './services/resultProcessor.service';
import { ExamResultController } from './controllers/examResult.controller';
import { ResultPublishController } from './controllers/resultPublish.controller';
import { ResultPublishService } from './services/resultPublish.service';
import { ExamDeliverablesController } from './controllers/examDeliverables.controller';
import { ExamSeatingController } from './controllers/examSeating.controller';
import { ExamQuestionPaperController } from './controllers/examQuestionPaper.controller';
import { ExamAnalyticsController } from './controllers/examAnalytics.controller';
import { ExamConductController } from './controllers/examConduct.controller';
import { ExamEvaluationController } from './controllers/examEvaluation.controller';
import { ExamExportController } from './controllers/examExport.controller';
import { ExamAdminBridgeController } from './controllers/examAdminBridge.controller';
import { ExamHallTicketController } from './controllers/examHallTicket.controller';
import { ExamHallController } from './controllers/examHall.controller';
import { ExamVersioningController } from './controllers/examVersioning.controller';
import { ExamTimelineController } from './controllers/examTimeline.controller';

export const examRouter = Router();
// ======================================
// SUBJECTS
// ======================================

// GET /subjects?classId=
examRouter.get('/subjects',
    checkPermission(PERMISSIONS.SUBJECT_VIEW),
    async (req, res) => {
        try {
            const classId = req.query.classId as string;
            const schoolId = req.context!.user.school_id;

            // Handle invalid/undefined classId explicitly
            if (!classId || classId === 'undefined') {
                return res.json([]); // Return empty list instead of crashing or querying all
            }

            let query = supabase
                .from('subjects')
                .select('*, class:class_id(name)')
                .eq('school_id', schoolId)
                .order('name');

            if (classId) query = query.eq('class_id', classId);

            const { data, error } = await query;
            if (error) throw error;
            res.json(data);
        } catch (err: any) {
            console.error("GET /subjects Error:", err);
            res.status(500).json({ error: err.message });
        }
    }
);

// POST /subjects
examRouter.post('/subjects',
    checkPermission(PERMISSIONS.SUBJECT_CREATE),
    async (req, res) => {
        const schoolId = req.context!.user.school_id;
        const { class_id, name, code } = req.body;

        if (!class_id || !name) return res.status(400).json({ error: "Missing fields" });

        const { data, error } = await supabase
            .from('subjects')
            .insert({ school_id: schoolId, class_id, name, code })
            .select()
            .single();

        if (error) return res.status(500).json({ error: error.message });
        res.status(201).json(data);
    }
);

// ======================================
// EXAMS
// ======================================

// GET /exams
examRouter.get('/',
    checkPermission(PERMISSIONS.EXAM_VIEW),
    async (req, res) => {
        try {
            const schoolId = req.context!.user.school_id;

            const { data, error } = await supabase
                .from('exams')
                .select('*, academic_year:academic_year_id(year_label)')
                .eq('school_id', schoolId)
                .order('start_date', { ascending: false });

            if (error) throw error;
            res.json(data);
        } catch (err: any) {
            console.error("GET /exams Error:", err);
            res.status(500).json({ error: err.message || "Internal Server Error" });
        }
    }
);

// GET /:examId/classes (Fetch Classes Mapped to Exam)
examRouter.get('/:examId/classes',
    checkPermission(PERMISSIONS.EXAM_VIEW),
    async (req, res) => {
        try {
            const { examId } = req.params;
            const data = await ExamEligibilityService.getClassesForExam(examId);
            res.json(data);
        } catch (err: any) {
            console.error("GET /exams/:examId/classes Error:", err);
            res.status(err.message === "Exam not found or invalid." ? 404 : 500).json({ error: err.message });
        }
    }
);

// POST /exams
examRouter.post('/',
    checkPermission(PERMISSIONS.EXAM_CREATE),
    async (req, res) => {
        try {
            const schoolId = req.context!.user.school_id;
            const { name, academic_year_id, start_date, end_date, term, applicable_classes, type } = req.body;

            // 1. Mandatory Fields (Hardened Phase-5)
            if (!academic_year_id || !term || !name) {
                return res.status(400).json({ error: "Missing required fields (academic_year_id, term, name)" });
            }

            // 2. Check Year Status
            const { data: year } = await supabase
                .from('academic_years')
                .select('status')
                .eq('id', academic_year_id)
                .single();

            if (year?.status === 'CLOSED') {
                return res.status(403).json({ error: "Cannot create exams in a CLOSED academic year." });
            }

            const { data, error } = await supabase
                .from('exams')
                .insert({
                    school_id: schoolId,
                    name,
                    academic_year_id,
                    start_date,
                    end_date,
                    term,
                    applicable_classes,
                    type,
                    status: 'DRAFT',
                    created_by: req.context!.user.id
                })
                .select()
                .single();

            if (error) throw error;
            res.status(201).json(data);
        } catch (err: any) {
            console.error("POST /exams Error:", err);
            res.status(500).json({ error: err.message });
        }
    }
);

// PUT /:id (Update Exam)
examRouter.put('/:id',
    checkPermission(PERMISSIONS.EXAM_CREATE),
    async (req, res) => {
        try {
            const { id } = req.params;
            const schoolId = req.context!.user.school_id;
            const { name, start_date, end_date, applicable_classes, type, status } = req.body;

            const updates: any = {};
            if (name) updates.name = name;
            if (start_date) updates.start_date = start_date;
            if (end_date) updates.end_date = end_date;
            if (applicable_classes !== undefined) updates.applicable_classes = applicable_classes; // Allow empty array or null
            if (type) updates.type = type;
            if (status) updates.status = status;

            const { data, error } = await supabase
                .from('exams')
                .update(updates)
                .eq('id', id)
                .eq('school_id', schoolId)
                .select()
                .single();

            if (error) throw error;
            res.json(data);
        } catch (err: any) {
            console.error("PUT /exams Error:", err);
            res.status(500).json({ error: err.message });
        }
    }
);

// DELETE /:id (Delete Exam)
examRouter.delete('/:id',
    checkPermission(PERMISSIONS.EXAM_CREATE),
    async (req, res) => {
        try {
            const { id } = req.params;
            const schoolId = req.context!.user.school_id;

            // Simple delete attempt
            const { error } = await supabase
                .from('exams')
                .delete()
                .eq('id', id)
                .eq('school_id', schoolId);

            if (error) {
                // If generic constraint error (common in PG for FK violations)
                if (error.code === '23503') {
                    return res.status(409).json({
                        error: "Cannot delete this exam because it has associated data (schedules, results, etc.). Please delete dependent data first."
                    });
                }
                throw error;
            }

            res.json({ success: true, message: "Exam deleted successfully" });
        } catch (err: any) {
            console.error("DELETE /exams Error:", err);
            // Detect Supabase/Postgrest constraint error if thrown
            if (err?.code === '23503') {
                return res.status(409).json({
                    error: "Cannot delete this exam because it has associated data (schedules, results, etc.). Please delete dependent data first."
                });
            }
            res.status(500).json({ error: err.message || "Deletion failed" });
        }
    }
);

// ======================================
// MARKS
// ======================================

// GET /marks/student/:studentId
examRouter.get('/marks/student/:studentId',
    checkPermission(PERMISSIONS.MARKS_VIEW),
    async (req, res) => {
        const { studentId } = req.params;
        const { examId } = req.query; // Optional filter

        // RLS handles visibility check (Parent vs Staff)
        let query = supabase
            .from('marks')
            .select(`
            marks_obtained, entered_at,
            exam:exam_id(name),
            subject:subject_id(name, code)
        `)
            .eq('student_id', studentId);

        if (examId) query = query.eq('exam_id', examId);

        const { data, error } = await query;
        if (error) return res.status(500).json({ error: error.message });
        res.json(data);
    }
);

// GET /marks/my (Parent/Student Shortcut)
examRouter.get('/marks/my',
    checkPermission(PERMISSIONS.MARKS_VIEW),
    async (req, res) => {
        try {
            const userId = req.context!.user.id; // Parent ID

            // 1. Find linked students
            const { data: links } = await supabase
                .from('student_parents')
                .select('student_id')
                .eq('parent_user_id', userId);

            // If no children linked (or Faculty causing this route to be hit), return empty.
            if (!links || links.length === 0) return res.json([]);

            const studentIds = links.map(l => l.student_id);

            // 2. Fetch marks
            const { data, error } = await supabase
                .from('marks')
                .select(`
                student_id, marks_obtained,
                student:student_id(full_name),
                exam:exam_id(name),
                subject:subject_id(name)
            `)
                .in('student_id', studentIds)
                .order('entered_at', { ascending: false });

            if (error) throw error;
            res.json(data);
        } catch (err: any) {
            console.error("GET /marks/my Error:", err);
            res.status(500).json({ error: err.message });
        }
    }
);

// POST /marks (Bulk or Single Entry)
examRouter.post('/marks',
    checkPermission(PERMISSIONS.MARKS_ENTER),
    async (req, res) => {
        try {
            const userId = req.context!.user.id;

            // --- PHASE 17A: HARDENED VALIDATION ---
            const marksSchema = z.object({
                student_id: z.string().uuid(),
                exam_id: z.string().uuid(),
                subject_id: z.string().uuid(),
                marks_obtained: z.number()
                    .min(0, "Marks cannot be negative")
                    .refine(val => {
                        const decimals = val.toString().split('.')[1];
                        return !decimals || decimals.length <= 2;
                    }, "Marks can have at most 2 decimal places")
            });

            const validated = marksSchema.safeParse(req.body);
            if (!validated.success) {
                return res.status(400).json({
                    error: "Validation failed",
                    details: validated.error.flatten().fieldErrors
                });
            }

            const { student_id, exam_id, subject_id, marks_obtained } = validated.data;
            // --------------------------------------

            // --- PHASE-4 CHECK: ELIGIBILITY & SEATING ---
            const { data: sch } = await supabase
                .from('exam_schedules')
                .select('id, exams!inner(seating_status, hall_ticket_status, result_status)')
                .eq('exam_id', exam_id)
                .eq('subject_id', subject_id)
                .single();

            const exam = (sch as any)?.exams;

            if (exam?.seating_status !== 'PUBLISHED') {
                return res.status(403).json({ error: "Seating is not published. Marks entry is not allowed." });
            }

            if (exam?.hall_ticket_status !== 'PUBLISHED') {
                return res.status(403).json({ error: "Hall tickets are not published. Marks entry is not yet available." });
            }

            if (exam?.result_status === 'PUBLISHED') {
                return res.status(423).json({ error: "Results are already published and locked.", code: "LOCKED" });
            }

            const { data: seating } = await supabase
                .from('exam_seating_allocations')
                .select('id')
                .eq('student_id', student_id)
                .eq('exam_schedule_id', sch?.id)
                .single();

            if (!seating) {
                return res.status(403).json({ error: "Student is not seated for this subject. Only snapshot-eligible students can have marks entered." });
            }

            // TODO: Verify Faculty Section Assignment for Strict Control

            const { data, error } = await supabase
                .from('marks')
                .upsert({
                    student_id,
                    exam_id,
                    subject_id,
                    marks_obtained,
                    entered_by: userId,
                    entered_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;

            // --- PHASE-3 HOOK: RESULT PROCESSING ---
            // Run asynchronously to not delay response
            // We pass schoolId from context
            const schoolId = req.context!.user.school_id;
            ResultProcessorService.processStudentResult(student_id, exam_id, schoolId)
                .catch(err => console.error("Async Result Calc Failed:", err));
            // ---------------------------------------

            res.json(data);
        } catch (err: any) {
            console.error("POST /marks Error:", err);
            res.status(500).json({ error: err.message });
        }
    }
);

// ======================================
// DASHBOARD PROJECTIONS (READ-ONLY)
// ======================================

examRouter.get('/dashboard/student/exam-timeline',
    checkPermission(PERMISSIONS.EXAM_VIEW),
    ExamTimelineController.getStudentTimeline
);

examRouter.get('/dashboard/faculty/exam-timeline',
    checkPermission(PERMISSIONS.EXAM_VIEW),
    ExamTimelineController.getFacultyTimeline
);

// ======================================
// EXAM SCHEDULES
// ======================================

// GET /exam-schedules?examId=
examRouter.get('/exam-schedules',
    checkPermission(PERMISSIONS.EXAM_VIEW),
    ExamScheduleController.getSchedules
);

// POST /exam-schedules
examRouter.post('/exam-schedules',
    checkPermission(PERMISSIONS.EXAM_CREATE),
    ExamScheduleController.createSchedule
);

// PUT /exam-schedules/:id (Update)
examRouter.put('/exam-schedules/:id',
    checkPermission(PERMISSIONS.EXAM_CREATE),
    (req, res) => ExamScheduleController.updateSchedule(req, res)
);

// ======================================
// ELIGIBILITY
// ======================================

// GET /exam-eligibility?examId=&studentId=
examRouter.get('/exam-eligibility',
    checkPermission(PERMISSIONS.EXAM_VIEW),
    ExamEligibilityController.checkEligibility
);

// GET /class-eligibility/exam/:examId/class/:classId
examRouter.get('/class-eligibility/exam/:examId/class/:classId',
    checkPermission(PERMISSIONS.EXAM_VIEW),
    ExamEligibilityController.getClassEligibility
);

// Freeze Eligibility (Persists LIVE status into Snapshots)
examRouter.post('/eligibility/freeze',
    checkPermission(PERMISSIONS.EXAM_CREATE),
    ExamEligibilityController.freezeEligibility
);

// Override Eligibility (Audited correction)
examRouter.post('/eligibility/override',
    checkPermission(PERMISSIONS.EXAM_CREATE),
    ExamEligibilityController.overrideEligibility
);

// Bootstrap Eligibility (Architect Bootstrapper)
examRouter.post('/eligibility/bootstrap',
    checkPermission(PERMISSIONS.EXAM_CREATE),
    ExamEligibilityController.bootstrapEligibility
);

// ======================================
// ADMIN BRIDGE (MANUAL OVERRIDES)
// ======================================

// GET /admin/bridge/:classId/status?academicYearId=
examRouter.get('/admin/bridge/:classId/status',
    checkPermission(PERMISSIONS.EXAM_CREATE),
    ExamAdminBridgeController.getClassBridgeData
);

// POST /admin/bridge/attendance
examRouter.post('/admin/bridge/attendance',
    checkPermission(PERMISSIONS.EXAM_CREATE),
    ExamAdminBridgeController.setAttendance
);

// POST /admin/bridge/fees
examRouter.post('/admin/bridge/fees',
    checkPermission(PERMISSIONS.EXAM_CREATE),
    ExamAdminBridgeController.setFeeStatus
);

// ======================================
// CONDUCT & ATTENDANCE
// ======================================

examRouter.post('/conduct/attendance',
    checkPermission(PERMISSIONS.MARKS_ENTER), // Staff conducting can mark attendance
    ExamConductController.markAttendance
);

examRouter.get('/conduct/attendance',
    checkPermission(PERMISSIONS.EXAM_VIEW),
    ExamConductController.getHallAttendance
);

// ======================================
// EVALUATION & LOCKING
// ======================================

examRouter.post('/evaluation/lock-subject',
    checkPermission(PERMISSIONS.EXAM_CREATE), // Usually Admin finalized
    ExamEvaluationController.lockSubject
);

examRouter.post('/evaluation/unlock-subject/:id',
    checkPermission(PERMISSIONS.EXAM_CREATE),
    ExamEvaluationController.unlockSubject
);

// ======================================
// RESULTS
// ======================================

// GET /exam/results?examId=&studentId=
examRouter.get('/results',
    checkPermission(PERMISSIONS.MARKS_VIEW),
    ExamResultController.getStudentResult
);

// POST /exam/publish-results
examRouter.post('/publish-results',
    checkPermission(PERMISSIONS.EXAM_CREATE), // Admin usually has this
    ResultPublishController.publishResults
);

// ======================================
// DELIVERABLES (READ ONLY)
// ======================================

// GET /exam/hall-ticket?examId=&studentId=
examRouter.get('/hall-ticket',
    checkPermission(PERMISSIONS.EXAM_VIEW),
    ExamDeliverablesController.getHallTicket
);

// PHASE 17C: PDF RESULTS & BULK DOWNLOAD
examRouter.get('/:examId/result/:studentId/pdf',
    checkPermission(PERMISSIONS.MARKS_VIEW),
    ExamDeliverablesController.generateStudentPDF
);

examRouter.get('/:examId/result/bulk-download',
    checkPermission(PERMISSIONS.EXAM_CREATE),
    ExamDeliverablesController.bulkDownloadResults
);

// PHASE 18: PROGRESS REPORTS
examRouter.get('/:examId/progress-report/:studentId/pdf',
    checkPermission(PERMISSIONS.MARKS_VIEW),
    ExamDeliverablesController.generateProgressReportPDF
);

examRouter.get('/:examId/progress-report/bulk-download',
    checkPermission(PERMISSIONS.EXAM_CREATE),
    ExamDeliverablesController.bulkDownloadProgressReports
);

// ======================================
// GLOBAL HALL MANAGEMENT (v1)
// ======================================

examRouter.get('/v1/exam-halls',
    checkPermission(PERMISSIONS.EXAM_CREATE),
    ExamHallController.listHalls
);

examRouter.post('/v1/exam-halls',
    checkPermission(PERMISSIONS.EXAM_CREATE),
    ExamHallController.createHall
);

examRouter.put('/v1/exam-halls/:id',
    checkPermission(PERMISSIONS.EXAM_CREATE),
    ExamHallController.updateHall
);

examRouter.patch('/v1/exam-halls/:id/toggle',
    checkPermission(PERMISSIONS.EXAM_CREATE),
    ExamHallController.toggleActive
);

examRouter.delete('/v1/exam-halls/:id',
    checkPermission(PERMISSIONS.EXAM_CREATE),
    ExamHallController.deleteHall
);

// ======================================
// SEATING (ADMIN ONLY)
// ======================================

// POST /exams/seating/generate
examRouter.post('/seating/generate',
    checkPermission(PERMISSIONS.EXAM_CREATE),
    ExamSeatingController.generateSeating
);

// POST /exams/seating/publish
examRouter.post('/seating/publish',
    checkPermission(PERMISSIONS.EXAM_CREATE),
    ExamSeatingController.publishSeating
);

// POST /exams/seating/reset
examRouter.post('/seating/reset',
    checkPermission(PERMISSIONS.EXAM_CREATE),
    ExamSeatingController.resetSeating
);

// GET /exams/seating/eligible-students
examRouter.get('/seating/eligible-students',
    checkPermission(PERMISSIONS.EXAM_VIEW),
    ExamSeatingController.getEligibleStudents
);

// GET /exams/seating
examRouter.get('/seating',
    checkPermission(PERMISSIONS.EXAM_VIEW),
    ExamSeatingController.getSeatingView
);

// ======================================
// HALL TICKETS
// ======================================

// POST /exams/hall-tickets/generate
examRouter.post('/hall-tickets/generate',
    checkPermission(PERMISSIONS.EXAM_CREATE),
    ExamHallTicketController.generateTickets
);

// POST /exams/hall-tickets/publish (Phase-3)
examRouter.post('/hall-tickets/publish',
    checkPermission(PERMISSIONS.EXAM_CREATE),
    ExamHallTicketController.publishTickets
);

// GET /exams/hall-tickets
examRouter.get('/hall-tickets',
    checkPermission(PERMISSIONS.EXAM_VIEW),
    ExamHallTicketController.getHallTickets
);

// GET /exams/hall-tickets/my
examRouter.get('/hall-tickets/my',
    checkPermission(PERMISSIONS.EXAM_VIEW),
    ExamHallTicketController.getMyHallTicket
);

// PHASE-14: PDF GENERATION
// GET /api/v1/exams/hall-ticket/:examId/:studentId/pdf
examRouter.get('/hall-ticket/:examId/:studentId/pdf',
    checkPermission(PERMISSIONS.EXAM_VIEW),
    ExamHallTicketController.generateStudentPDF
);

// POST /api/v1/exams/:examId/hall-ticket/reissue
examRouter.post('/:examId/hall-ticket/reissue',
    checkPermission(PERMISSIONS.EXAM_CREATE),
    ExamHallTicketController.bulkReissueZip
);

// ======================================
// QUESTION PAPERS (ADMIN/FACULTY)
// ======================================

// GET /exams/question-papers?examScheduleId=
examRouter.get('/question-papers',
    checkPermission(PERMISSIONS.EXAM_VIEW),
    ExamQuestionPaperController.list
);

// POST /exams/question-papers (Upload)
examRouter.post('/question-papers',
    checkPermission(PERMISSIONS.EXAM_CREATE), // Or new QP_UPLOAD permission
    ExamQuestionPaperController.upload
);

// POST /exams/question-papers/lock
examRouter.post('/question-papers/lock',
    checkPermission(PERMISSIONS.EXAM_CREATE),
    ExamQuestionPaperController.lock
);

// ======================================
// ANALYTICS (ADMIN ONLY)
// ======================================

// GET /exams/analytics/overview?examId=
examRouter.get('/analytics/overview',
    checkPermission(PERMISSIONS.EXAM_VIEW), // Or ANALYTICS_VIEW if exists
    ExamAnalyticsController.getOverview
);

// GET /exams/analytics/grades?examId=
examRouter.get('/analytics/grades',
    checkPermission(PERMISSIONS.EXAM_VIEW),
    ExamAnalyticsController.getGrades
);

// GET /exams/analytics/subjects?examId=
examRouter.get('/analytics/subjects',
    checkPermission(PERMISSIONS.EXAM_VIEW),
    ExamAnalyticsController.getSubjects
);

// GET /exams/analytics/top-performers?examId=&limit=
examRouter.get('/analytics/top-performers',
    checkPermission(PERMISSIONS.EXAM_VIEW),
    ExamAnalyticsController.getTopPerformers
);

// GET /exams/analytics/compliance?examId=
examRouter.get('/analytics/compliance',
    checkPermission(PERMISSIONS.EXAM_VIEW),
    ExamAnalyticsController.getCompliance
);

// GET /exams/analytics/sections?examId=
examRouter.get('/analytics/sections',
    checkPermission(PERMISSIONS.EXAM_VIEW),
    ExamAnalyticsController.getSectionAnalytics
);

// GET /exams/analytics/audit?examId=
examRouter.get('/analytics/audit',
    checkPermission(PERMISSIONS.EXAM_VIEW),
    ExamAnalyticsController.getAuditTrails
);

// POST /exams/results/publish (Phase-3)
examRouter.post('/results/publish',
    checkPermission(PERMISSIONS.EXAM_CREATE),
    ResultPublishController.publishResults
);

// ======================================
// REVISION CONTROL & VERSIONING (Phase-12)
// ======================================

// GET /exams/:examId/seating/versions
examRouter.get('/:examId/seating/versions',
    checkPermission(PERMISSIONS.EXAM_VIEW),
    ExamVersioningController.getSeatingVersions
);

// GET /exams/:examId/results/versions
examRouter.get('/:examId/results/versions',
    checkPermission(PERMISSIONS.EXAM_VIEW),
    ExamVersioningController.getResultVersions
);

// POST /exams/:examId/seating/versions/:version/restore
examRouter.post('/:examId/seating/versions/:version/restore',
    checkPermission(PERMISSIONS.EXAM_CREATE),
    ExamVersioningController.restoreSeatingVersion
);

// ======================================
// EXPORTS (ADMIN ONLY)
// ======================================

// GET /exams/export/results?examId=
examRouter.get('/export/results',
    checkPermission(PERMISSIONS.EXAM_CREATE),
    ExamExportController.exportResults
);

// GET /exams/export/conduct?examId=
examRouter.get('/export/conduct',
    checkPermission(PERMISSIONS.EXAM_CREATE),
    ExamExportController.exportConductReport
);

// GET /exams/export/audit?examId=
examRouter.get('/export/audit',
    checkPermission(PERMISSIONS.EXAM_CREATE),
    ExamExportController.exportAuditTrail
);
