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

// GET / - List Students (supports filtering)
studentRouter.get('/',
    checkPermission(PERMISSIONS.STUDENT_VIEW),
    async (req: Request, res: Response) => {
        const schoolId = req.context!.user.school_id;
        const sectionId = req.query.sectionId as string;
        const { page, limit, search } = req.query;

        // 1. Get Active Academic Year
        const { data: activeYear } = await supabase
            .from('academic_years')
            .select('id')
            .eq('school_id', schoolId)
            .eq('is_active', true)
            .maybeSingle();

        // 2. Build Query
        // We filter student_sections to only show the one for the active academic year
        let query = supabase
            .from('students')
            .select(`
                *,
                admission:admission_id(*),
                sections:student_sections(
                    academic_year_id,
                    section:section_id(
                        id,
                        name,
                        class_id,
                        class:class_id(id, name)
                    )
                )
            `, { count: 'exact' })
            .eq('school_id', schoolId)
            .eq('status', 'active');

        if (search) {
            query = applySearch(query, search as string, ['full_name', 'student_code']);
        }

        if (sectionId) {
            const { data: sectionStudents, error: secError } = await supabase
                .from('student_sections')
                .select('student_id')
                .eq('section_id', sectionId);

            if (secError) {
                console.error("[StudentRoute] Section Error", secError);
                return res.status(500).json({ error: secError.message });
            }

            const ids = sectionStudents.map(s => s.student_id);
            console.log(`[StudentRoute] Section ${sectionId} has ${ids.length} students`);

            if (ids.length === 0) {
                return res.json(createPaginatedResult([], 0, Number(page) || 1, Number(limit) || 10));
            }

            query = query.in('id', ids);
        }

        const { from, to } = getPaginationRange(Number(page), Number(limit));

        // Default sort
        const sortColumn = (req.query.sortBy as string) || 'full_name';
        const sortOrder = (req.query.sortOrder as string) === 'desc' ? false : true; // visual 'asc' = true (ascending), 'desc' = false (descending) for supabase

        // Allow-list for reachable columns to prevent injection or errors
        const allowedSorts = ['student_code', 'full_name', 'date_of_birth', 'gender', 'email', 'phone', 'address', 'created_at'];
        if (allowedSorts.includes(sortColumn)) {
            query = query.order(sortColumn, { ascending: sortOrder });
        } else {
            query = query.order('full_name', { ascending: true });
        }

        query = query.range(from, to);

        const { data, count, error } = await query;

        if (error) return res.status(500).json({ error: error.message });

        // 3. Post-Process to ensure 'sections' only contains the active year (LEFT JOIN logic)
        const enrichedData = (data || []).map(student => {
            const currentYearSection = activeYear
                ? student.sections?.find((s: any) => s.academic_year_id === activeYear.id)
                : null;

            return {
                ...student,
                // Override sections with just the current one or empty array to maintain compatibility
                sections: currentYearSection ? [currentYearSection] : []
            };
        });

        res.json(createPaginatedResult(enrichedData, count, Number(page) || 1, Number(limit) || 10));
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

// ======================================
// ACADEMIC HISTORY (Student/Parent)
// ======================================

// GET /academic-history?studentId=...
studentRouter.get('/academic-history',
    checkPermission(PERMISSIONS.STUDENT_VIEW_SELF),
    async (req: Request, res: Response) => {
        const studentId = req.query.studentId as string;
        if (!studentId) return res.status(400).json({ error: "studentId is required" });

        try {
            // RLS handles visibility but we can order by year start_date
            const { data: history, error } = await supabase
                .from('student_sections')
                .select(`
                    academic_year_id,
                    academic_year:academic_year_id(id, year_label, status),
                    section:section_id(
                        name,
                        class:class_id(name)
                    )
                `)
                .eq('student_id', studentId);

            if (error) throw error;

            // Format and sort by year label or we could fetch dates if needed. 
            // Since we don't have start_date here and don't want to change schema, 
            // we'll assume year_label order is alphabetical/logical for now or sort in code.
            const formatted = history.map((h: any) => ({
                academic_year_id: h.academic_year_id,
                academic_year_label: h.academic_year.year_label,
                year_status: h.academic_year.status || 'ACTIVE',
                class_name: h.section.class.name,
                section_name: h.section.name
            })).sort((a, b) => b.academic_year_label.localeCompare(a.academic_year_label));

            res.json(formatted);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    }
);

// GET /exam-history?academic_year_id=...&studentId=...
studentRouter.get('/exam-history',
    checkPermission(PERMISSIONS.MARKS_VIEW),
    async (req: Request, res: Response) => {
        const { academic_year_id, studentId } = req.query;

        if (!academic_year_id || !studentId) {
            return res.status(400).json({ error: "academic_year_id and studentId are required" });
        }

        try {
            // 1. Get Exams for that year
            const { data: exams, error: examError } = await supabase
                .from('exams')
                .select('id, name')
                .eq('academic_year_id', academic_year_id);

            if (examError) throw examError;
            if (!exams || exams.length === 0) return res.json([]);

            // 2. Get Published Summaries
            const { data: summaries, error: sumError } = await supabase
                .from('student_result_summaries')
                .select('*')
                .eq('student_id', studentId)
                .in('exam_id', exams.map(e => e.id));

            if (sumError) throw sumError;

            // 3. Map result
            const results = exams.map(exam => {
                const summary = summaries?.find(s => s.exam_id === exam.id);
                return {
                    exam_id: exam.id,
                    exam_name: exam.name,
                    result_status: summary?.result_status || 'NOT_PROCESSED',
                    is_published: summary?.is_published || false,
                    published_at: summary?.published_at,
                    report_card_id: summary?.id
                };
            });

            res.json(results);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    }
);
