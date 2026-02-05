-- ==========================================
-- 021_classwork_assignments.sql
-- Adding Assignments and Homework module
-- ==========================================

-- 1. ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
    section_id UUID REFERENCES public.sections(id) ON DELETE CASCADE NOT NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
    teacher_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    max_marks NUMERIC(5,2),
    file_url TEXT, -- For assignment handouts/images
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ASSIGNMENT_SUBMISSIONS (Optional for now, but good to have)
CREATE TABLE IF NOT EXISTS public.assignment_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    
    submission_text TEXT,
    submission_files TEXT[], -- Array of URLs
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    marks_obtained NUMERIC(5,2),
    feedback TEXT,
    graded_at TIMESTAMP WITH TIME ZONE,
    graded_by UUID REFERENCES public.users(id),
    
    UNIQUE (assignment_id, student_id)
);

-- 3. RLS POLICIES
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;

-- VIEW ASSIGNMENTS
CREATE POLICY "School users view assignments" ON public.assignments
    FOR SELECT USING (school_id = public.get_my_school_id());

-- MANAGE ASSIGNMENTS (Admin + Teacher of that section)
CREATE POLICY "Teachers manage own assignments" ON public.assignments
    FOR ALL USING (
        school_id = public.get_my_school_id() AND (
            auth.uid() = teacher_user_id OR 
            EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.name = 'ADMIN')
        )
    );

-- VIEW SUBMISSIONS (Teacher + Admin + Student Self)
CREATE POLICY "View submissions" ON public.assignment_submissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.assignments a 
            WHERE a.id = public.assignment_submissions.assignment_id 
            AND (a.teacher_user_id = auth.uid() OR a.school_id = public.get_my_school_id())
        ) OR 
        EXISTS (
            SELECT 1 FROM public.students s 
            WHERE s.id = public.assignment_submissions.student_id 
            AND s.admission_id IN (SELECT id FROM public.admissions WHERE applicant_user_id = auth.uid())
        )
    );

-- 4. PERMISSIONS
INSERT INTO public.permissions (code, description) VALUES
('assignment.create', 'Create Assignments (Academic)'),
('assignment.edit', 'Edit Assignments (Academic)'),
('assignment.delete', 'Delete Assignments (Academic)'),
('assignment.view', 'View Assignments (Academic)'),
('assignment.grade', 'Grade Submissions (Academic)')
ON CONFLICT (code) DO NOTHING;

-- Assign to Roles (Admin & Faculty)
DO $$
DECLARE
    admin_id UUID;
    faculty_id UUID;
BEGIN
    SELECT id INTO admin_id FROM public.roles WHERE name = 'ADMIN';
    SELECT id INTO faculty_id FROM public.roles WHERE name = 'FACULTY';
    
    IF admin_id IS NOT NULL THEN
        INSERT INTO public.role_permissions (role_id, permission_id)
        SELECT admin_id, id FROM public.permissions WHERE code LIKE 'assignment.%'
        ON CONFLICT DO NOTHING;
    END IF;

    IF faculty_id IS NOT NULL THEN
        INSERT INTO public.role_permissions (role_id, permission_id)
        SELECT faculty_id, id FROM public.permissions WHERE code LIKE 'assignment.%'
        ON CONFLICT DO NOTHING;
    END IF;
END $$;
