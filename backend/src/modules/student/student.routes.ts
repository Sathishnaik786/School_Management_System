import { Router, Request, Response } from 'express';
import { checkPermission } from '../../rbac/rbac.middleware';
import { PERMISSIONS } from '../../rbac/permissions';
import { supabase } from '../../config/supabase';
import { z } from 'zod';
import { getPaginationRange, applySearch, createPaginatedResult } from '../../utils/queryHelpers';

export const studentRouter = Router();

// ======================================
// ADMIN / FACULTY ROUTES
// ======================================

// GET / - List Students
// GET / - List Students (supports filtering)
studentRouter.get('/',
    checkPermission(PERMISSIONS.STUDENT_VIEW),
    async (req: Request, res: Response) => {
        const schoolId = req.context!.user.school_id;
        const sectionId = req.query.sectionId as string;
        const { page, limit, search } = req.query;

        let query = supabase
            .from('students')
            .select('*, parents:student_parents(user:parent_user_id(full_name, email)), sections:student_sections(section_id)', { count: 'exact' })
            .eq('school_id', schoolId)
            .eq('status', 'active');

        if (search) {
            query = applySearch(query, search as string, ['full_name', 'student_code']);
        }

        if (sectionId) {
            // Filter via join is tricky in simple Supabase select string without foreign key embedding in a specific way.
            // Alternative: Fetch students in section first.
            const { data: sectionStudents, error: secError } = await supabase
                .from('student_sections')
                .select('student_id')
                .eq('section_id', sectionId);

            if (secError) return res.status(500).json({ error: secError.message });

            const ids = sectionStudents.map(s => s.student_id);
            query = query.in('id', ids);
        }

        const { from, to } = getPaginationRange(Number(page), Number(limit));
        query = query.order('full_name').range(from, to);

        const { data, count, error } = await query;

        if (error) return res.status(500).json({ error: error.message });
        res.json(createPaginatedResult(data, count, Number(page) || 1, Number(limit) || 10));
    }
);

// GET /:id - Detail
studentRouter.get('/:id',
    checkPermission(PERMISSIONS.STUDENT_VIEW),
    async (req: Request, res: Response) => {
        const { id } = req.params;
        const schoolId = req.context!.user.school_id;

        const { data, error } = await supabase
            .from('students')
            .select('*, parents:student_parents(user:parent_user_id(full_name, email))')
            .eq('id', id)
            .eq('school_id', schoolId)
            .single();

        if (error) return res.status(500).json({ error: error.message });
        res.json(data);
    }
);

// POST /from-admission/:admissionId - Convert Admission to Student
studentRouter.post('/from-admission/:admissionId',
    checkPermission(PERMISSIONS.STUDENT_CREATE),
    async (req: Request, res: Response) => {
        const { admissionId } = req.params;
        const schoolId = req.context!.user.school_id;

        try {
            // 1. Fetch Admission
            const { data: admission, error: admError } = await supabase
                .from('admissions')
                .select('*')
                .eq('id', admissionId)
                .eq('school_id', schoolId)
                .single();

            if (admError || !admission) return res.status(404).json({ error: 'Admission not found' });

            if (admission.status !== 'approved') {
                return res.status(400).json({ error: 'Admission must be APPROVED before conversion' });
            }

            // 2. Check overlap
            const { count } = await supabase
                .from('students')
                .select('*', { count: 'exact', head: true })
                .eq('admission_id', admissionId);

            if (count && count > 0) {
                return res.status(400).json({ error: 'Student already exists for this admission' });
            }

            // 3. Generate Student Code (Simple Logic: STU-<Year>-<Random>)
            const yearSuffix = new Date().getFullYear();
            const randomCode = Math.floor(1000 + Math.random() * 9000);
            const code = `STU-${yearSuffix}-${randomCode}`;

            // 4. Create Student (Transactional ideally, but Sequential here)
            // Insert Student
            const { data: student, error: stuError } = await supabase
                .from('students')
                .insert({
                    school_id: schoolId,
                    admission_id: admissionId,
                    student_code: code,
                    full_name: admission.student_name,
                    date_of_birth: admission.date_of_birth,
                    gender: admission.gender,
                    status: 'active'
                })
                .select()
                .single();

            if (stuError) throw stuError;

            // 5. Link Parent
            // Assuming admission.applicant_user_id is the parent
            const { error: parentError } = await supabase
                .from('student_parents')
                .insert({
                    student_id: student.id,
                    parent_user_id: admission.applicant_user_id,
                    relation: 'guardian' // Default, can be updated later
                });

            if (parentError) {
                // Rollback student? Supabase HTTP API doesn't support multi-table transaction blocks easily without RPC.
                // For now, we log error. In production, use RPC for atomicity.
                console.error("Failed to link parent", parentError);
                return res.status(500).json({ error: 'Student created but parent link failed. Please contact support.' });
            }

            res.status(201).json(student);

        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    }
);

// ======================================
// PARENT ROUTES
// ======================================

// GET /my - View Own Children
studentRouter.get('/my/children',
    checkPermission(PERMISSIONS.STUDENT_VIEW_SELF),
    async (req: Request, res: Response) => {
        const userId = req.context!.user.id;

        // RLS handles visibility, but we can also explicit filter for clarity/speed
        const { data: links, error } = await supabase
            .from('student_parents')
            .select(`
            student:student_id (
                id, student_code, full_name, date_of_birth, gender, status,
                school:school_id(name)
            )
        `)
            .eq('parent_user_id', userId);

        if (error) return res.status(500).json({ error: error.message });

        // Flatten result
        const students = links.map((l: any) => l.student);
        res.json(students);
    }
);

// POST /my/link - Manual Link for Parents (Debug/Self-Service)
studentRouter.post('/my/link',
    checkPermission(PERMISSIONS.DASHBOARD_VIEW_PARENT),
    async (req: Request, res: Response) => {
        const { student_code } = req.body;
        const userId = req.context!.user.id;

        if (!student_code) return res.status(400).json({ error: "Student Code is required" });

        try {
            // 1. Find Student
            const { data: student, error: currError } = await supabase
                .from('students')
                .select('id, full_name')
                .eq('student_code', student_code)
                .maybeSingle();

            if (currError || !student) {
                return res.status(404).json({ error: "Student not found with that code" });
            }

            // 2. Check overlap
            const { data: existing } = await supabase
                .from('student_parents')
                .select('id')
                .eq('student_id', student.id)
                .eq('parent_user_id', userId)
                .maybeSingle();

            if (existing) return res.status(400).json({ error: "Already linked to this student" });

            // 3. Link
            const { error: linkError } = await supabase
                .from('student_parents')
                .insert({
                    student_id: student.id,
                    parent_user_id: userId,
                    relation: 'parent'
                });

            if (linkError) throw linkError;

            res.json({ message: "Linked successfully", student: student.full_name });
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    }
);
