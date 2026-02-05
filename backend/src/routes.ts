import { Router, Request, Response } from 'express';
import { authenticate, authenticateOptional, checkLoginApproval } from './auth/auth.middleware';
import { checkPermission } from './rbac/rbac.middleware';
import { PERMISSIONS } from './rbac/permissions';
import { supabase } from './config/supabase';
import { admissionRouter } from './modules/admission/admission.routes';
import { AdmissionController } from './modules/admission/admission.controller';
import { studentRouter } from './modules/student/student.routes';
import { academicRouter } from './modules/academic/academic.routes';
import { examRouter } from './modules/exam/exam.routes';
import { attendanceRouter } from './modules/attendance/attendance.routes';
import { timetableRouter } from './modules/timetable/timetable.routes';
import { dashboardRouter } from './modules/dashboard/dashboard.routes';
import { feesRouter } from './modules/fees/fees.routes';
import { transportRouter } from './modules/transport/transport.routes';
import { importRouter } from './modules/import/import.routes';
import { staffRouter } from './modules/staff/staff.routes';
import departmentRouter from './modules/departments/department.routes';

export const router = Router();

// ======================================
// PUBLIC
// ======================================
router.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Exposed Admission Route for registration & Guest Drafts
router.post('/admissions/public-apply', AdmissionController.publicApply);
router.post('/admissions', authenticateOptional, AdmissionController.create);

// Public lookup for schools
// Public lookup for schools
router.get('/schools', async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabase.from('schools').select('id, name').limit(10);
        if (error) throw error;
        res.json(data || []);
    } catch (error: any) {
        res.status(200).json([]); // Suppress error for public view
    }
});

// Public lookup for current year (required for registration if not hardcoded)
// Public lookup for current year (required for registration if not hardcoded)
router.get('/public/academic-year', async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabase
            .from('academic_years')
            .select('id, year_label')
            .eq('is_active', true)
            .limit(1)
            .maybeSingle();

        if (error) throw error;
        res.json(data); // Returns null if not found, with 200 OK
    } catch (error: any) {
        res.status(200).json(null);
    }
});

// ======================================
// PROTECTED (Global Guard)
// ======================================
router.use(authenticate);
router.use(checkLoginApproval);

// 1. GET /me
// 1. GET /me
router.get('/me', (req: Request, res: Response) => {
    res.json({
        user: req.context!.user
    });
});

// 2. GET /schools/current
// 2. GET /schools/current
router.get('/schools/current', async (req: Request, res: Response) => {
    const school_id = req.context!.user.school_id;
    if (!school_id) return res.status(404).json({ error: 'User not assigned to a school' });

    const { data, error } = await supabase.from('schools').select('*').eq('id', school_id).single();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// 3. GET /academic-years/current
// 3. GET /academic-years/current
router.get('/academic-years/current', async (req: Request, res: Response) => {
    const school_id = req.context!.user.school_id;
    const { data, error } = await supabase.from('academic_years').select('*').eq('school_id', school_id).eq('is_active', true).maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data); // Returns null if not found
});

// 3b. GET /academic-years (All)
// 3b. GET /academic-years (All)
router.get('/academic-years', async (req: Request, res: Response) => {
    const school_id = req.context!.user.school_id;
    const { data, error } = await supabase
        .from('academic_years')
        .select('*')
        .eq('school_id', school_id)
        .order('year_label', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// 4. POST /academic-years
// 4. POST /academic-years
router.post('/academic-years', async (req: Request, res: Response) => {
    const school_id = req.context!.user.school_id;
    const { year_label, is_active } = req.body;

    if (!year_label) return res.status(400).json({ error: "Year label is required" });

    // If making this active, deactivate others
    if (is_active) {
        await supabase.from('academic_years').update({ is_active: false }).eq('school_id', school_id);
    }

    const { data, error } = await supabase
        .from('academic_years')
        .insert({ school_id, year_label, is_active: is_active || false })
        .select()
        .single();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
});

// ======================================
// MODULE ROUTES
// ======================================
router.use('/admissions', admissionRouter);
router.use('/students', studentRouter);
router.use('/academic', academicRouter);
router.use('/exams', examRouter);
router.use('/attendance', attendanceRouter);
router.use('/timetable', timetableRouter);
router.use('/dashboard', dashboardRouter);
router.use('/fees', feesRouter);
router.use('/transport', transportRouter);
router.use('/import', importRouter);
router.use('/admin', staffRouter); // Mounting at /admin to match requirement /admin/staff-profiles
router.use('/admin/departments', departmentRouter);

