import { Router, Request, Response } from 'express';
import { checkPermission } from '../../rbac/rbac.middleware';
import { PERMISSIONS } from '../../rbac/permissions';
import { supabase } from '../../config/supabase';
import { z } from 'zod';
import { AssignmentController } from './assignment.controller';
import { AcademicAssignmentService } from './academic.service';
import { FacultyController } from './faculty.controller';

export const academicRouter = Router();

// ======================================
// CLASSES
// ======================================

// GET /classes
academicRouter.get('/classes',
    checkPermission(PERMISSIONS.CLASS_VIEW),
    async (req: Request, res: Response) => {
        const schoolId = req.context!.user.school_id;
        const { data, error } = await supabase
            .from('classes')
            .select(`
                *,
                academic_year:academic_year_id(year_label),
                sections:sections(count)
            `)
            .eq('school_id', schoolId)
            .order('name');

        if (error) return res.status(500).json({ error: error.message });
        res.json(data);
    }
);

// POST /classes
academicRouter.post('/classes',
    checkPermission(PERMISSIONS.CLASS_CREATE),
    async (req: Request, res: Response) => {
        const schoolId = req.context!.user.school_id;
        const { name, academic_year_id } = req.body;

        if (!name || !academic_year_id) return res.status(400).json({ error: "Missing fields" });

        const { data, error } = await supabase
            .from('classes')
            .insert({ school_id: schoolId, academic_year_id, name })
            .select()
            .single();

        if (error) return res.status(500).json({ error: error.message });
        res.status(201).json(data);
    }
);

// ======================================
// SECTIONS
// ======================================

// GET /sections?classId=...
academicRouter.get('/sections',
    checkPermission(PERMISSIONS.SECTION_VIEW),
    async (req: Request, res: Response) => {
        const classId = req.query.classId as string;
        if (!classId) return res.status(400).json({ error: "classId required" });

        const { data, error } = await supabase
            .from('sections')
            .select(`
                *,
                _count_students:student_sections(count)
            `)
            .eq('class_id', classId)
            .order('name');

        if (error) return res.status(500).json({ error: error.message });
        res.json(data);
    }
);

// POST /sections
academicRouter.post('/sections',
    checkPermission(PERMISSIONS.SECTION_CREATE),
    async (req: Request, res: Response) => {
        const { class_id, name } = req.body;
        if (!class_id || !name) return res.status(400).json({ error: "Missing fields" });

        const { data, error } = await supabase
            .from('sections')
            .insert({ class_id, name })
            .select()
            .single();

        if (error) return res.status(500).json({ error: error.message });
        res.status(201).json(data);
    }
);

// ======================================
// ASSIGNMENTS
// ======================================

// GET /academic/faculty (Admin view to list all faculty members)
academicRouter.get('/faculty',
    checkPermission(PERMISSIONS.STUDENT_VIEW), // Using a general staff view permission or specific if added
    async (req: Request, res: Response) => {
        const schoolId = req.context!.user.school_id;

        const { data, error } = await supabase
            .from('users')
            .select(`
                id, 
                full_name, 
                email,
                user_roles!inner (
                    role:roles!inner (name)
                )
            `)
            .eq('school_id', schoolId)
            .eq('user_roles.role.name', 'FACULTY');

        if (error) return res.status(500).json({ error: error.message });
        res.json(data);
    }
);

// POST /sections/:id/assign-faculty (UPGRADED WITH AUTO-SYNC)
academicRouter.post('/sections/:id/assign-faculty',
    checkPermission(PERMISSIONS.ACADEMIC_ASSIGN_FACULTY),
    async (req: Request, res: Response) => {
        const sectionId = req.params.id;
        const { faculty_user_id } = req.body;
        const performedBy = req.context!.user.id;

        try {
            // Fetch academic year for the section
            const { data: section, error: secError } = await supabase
                .from('sections')
                .select('class:classes(academic_year_id)')
                .eq('id', sectionId)
                .single();

            if (secError || !section) return res.status(404).json({ error: "Section not found" });
            const academicYearId = (section.class as any).academic_year_id;

            await AcademicAssignmentService.assignFacultyToSection({
                sectionId,
                facultyId: faculty_user_id,
                academicYearId,
                assignedBy: performedBy
            });

            res.json({ message: "Faculty assigned and students auto-mapped successfully" });
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    }
);

// GET /sections/:id/assignments
academicRouter.get('/sections/:id/assignments',
    checkPermission(PERMISSIONS.SECTION_VIEW),
    async (req: Request, res: Response) => {
        const sectionId = req.params.id;

        const { data, error } = await supabase
            .from('faculty_sections')
            .select(`
                role,
                faculty:faculty_user_id (id, full_name, email)
            `)
            .eq('section_id', sectionId);

        if (error) return res.status(500).json({ error: error.message });
        res.json(data);
    }
);

// POST /sections/:id/assign-student
academicRouter.post('/sections/:id/assign-student',
    checkPermission(PERMISSIONS.STUDENT_ASSIGN_SECTION),
    async (req: Request, res: Response) => {
        const sectionId = req.params.id;
        const { student_id } = req.body;
        const userId = req.context!.user.id;

        try {
            // 1. Fetch Student to get admission_id
            const { data: student, error: stuError } = await supabase
                .from('students')
                .select('id, admission_id, full_name')
                .eq('id', student_id)
                .single();

            if (stuError || !student) return res.status(404).json({ error: "Student not found" });

            // 2. Fetch Section details for the log
            const { data: section, error: secError } = await supabase
                .from('sections')
                .select('name, class:classes(name)')
                .eq('id', sectionId)
                .single();

            if (secError || !section) return res.status(404).json({ error: "Section not found" });

            // 3. Check if already assigned (optional but good)
            // Ideally we should check if student is already in a section for this class/year, 
            // but for now we just rely on unique constraint or allow multiple as per existing logic.

            // 4. Assign Student
            const { error } = await supabase
                .from('student_sections')
                .insert({ student_id, section_id: sectionId });

            if (error) {
                if (error.code === '23505') return res.status(400).json({ error: "Student already in this section" });
                throw error;
            }

            // 5. AUTO-SYNC: Map to existing faculty
            await AcademicAssignmentService.syncStudentWithSectionFaculty(
                student_id,
                sectionId,
                (section.class as any).academic_year_id
            );

            // 6. Log to Timeline (Admission Audit Logs)
            if (student.admission_id) {
                const className = (section.class as any)?.name || 'Unknown Class';
                await supabase.from('admission_audit_logs').insert({
                    admission_id: student.admission_id,
                    action: 'CLASS_ASSIGNED',
                    performed_by: userId,
                    remarks: `Assigned to Class ${className} - Section ${section.name}. Faculty auto-linked.`
                });
            }

            res.json({ message: "Assigned successfully and faculty mapped" });

        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    }
);

// GET /academic/my-students (Faculty View - Derived from student_faculty_assignments)
academicRouter.get('/my-students',
    async (req: Request, res: Response) => {
        const userId = req.context!.user.id;
        const { data, error } = await supabase
            .from('student_faculty_assignments')
            .select(`
                id, source, status,
                student:student_id (
                    id, student_code, full_name,
                    section_info:student_sections (
                        section:section_id (name, class:class_id (name))
                    )
                )
            `)
            .eq('faculty_id', userId)
            .eq('status', 'ACTIVE');

        if (error) return res.status(500).json({ error: error.message });
        res.json(data);
    }
);

// GET /sections/my (Faculty View)
academicRouter.get('/sections/my',
    checkPermission(PERMISSIONS.SECTION_VIEW),
    async (req: Request, res: Response) => {
        try {
            const { user } = req.context!;

            // ADMIN Bypass: Return ALL sections
            if (user.roles.includes('ADMIN') || user.roles.includes('HEAD_OF_INSTITUTE')) {
                const { data, error } = await supabase
                    .from('sections')
                    .select(`
                        id, name,
                        class:class_id (name, academic_year:academic_year_id(year_label))
                    `)
                    .eq('school_id', user.school_id)
                    .order('name');

                if (error) throw error;

                // Map to match the expected frontend structure: { section: ... }
                const mapped = data.map(s => ({
                    status: 'ACTIVE', // Dummy status
                    section: s
                }));
                return res.json(mapped);
            }

            // FACULTY: Return assigned sections
            const { data, error } = await supabase
                .from('section_faculty_assignments')
                .select(`
                    status,
                    section:section_id (
                        id, name,
                        class:class_id (name, academic_year:academic_year_id(year_label))
                    )
                `)
                .eq('faculty_id', user.id)
                .eq('status', 'ACTIVE');

            if (error) throw error;
            res.json(data);
        } catch (err: any) {
            console.error("GET sections/my error:", err);
            res.status(500).json({ error: err.message || "Internal Server Error" });
        }
    }
);

// ======================================
// CLASS WORK (ASSIGNMENTS)
// ======================================

academicRouter.post('/assignments',
    checkPermission(PERMISSIONS.CLASS_CREATE), // Re-using broad perm or specific if added
    AssignmentController.create
);

academicRouter.get('/assignments/section/:sectionId',
    checkPermission(PERMISSIONS.SECTION_VIEW),
    AssignmentController.getBySection
);

academicRouter.get('/assignments/teacher/my',
    checkPermission(PERMISSIONS.SECTION_VIEW),
    AssignmentController.getTeacherAssignments
);

academicRouter.get('/assignments/student/:studentId',
    checkPermission(PERMISSIONS.SECTION_VIEW),
    AssignmentController.getMyAssignments
);

// ======================================
// FACULTY PROFILES (ADMIN)
// ======================================

academicRouter.get('/faculty-profiles',
    checkPermission(PERMISSIONS.FACULTY_PROFILE_MANAGE),
    FacultyController.getAllProfiles
);

academicRouter.post('/faculty-profiles',
    checkPermission(PERMISSIONS.FACULTY_PROFILE_MANAGE),
    FacultyController.createProfile
);

academicRouter.put('/faculty-profiles/:id',
    checkPermission(PERMISSIONS.FACULTY_PROFILE_MANAGE),
    FacultyController.updateProfile
);

academicRouter.patch('/faculty-profiles/:id/status',
    checkPermission(PERMISSIONS.FACULTY_PROFILE_MANAGE),
    FacultyController.updateStatus
);

// ======================================
// SUBJECT ASSIGNMENTS (ADMIN)
// ======================================

academicRouter.post('/sections/:sectionId/subjects/:subjectId/assign-faculty',
    checkPermission(PERMISSIONS.SUBJECT_ASSIGN_FACULTY),
    FacultyController.assignSubject
);

academicRouter.get('/sections/:sectionId/subject-faculty',
    checkPermission(PERMISSIONS.ACADEMIC_VIEW),
    FacultyController.getSectionAssignments
);

// ======================================
// FACULTY SELF-SERVICE
// ======================================

academicRouter.get('/faculty/my-subjects',
    FacultyController.getMySubjects
);

academicRouter.put('/faculty/my-subjects/:assignmentId',
    checkPermission(PERMISSIONS.SUBJECT_UPDATE_OWN),
    FacultyController.updateMySubjectAssignment
);

