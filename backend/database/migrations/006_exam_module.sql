-- ==========================================
-- 1. TABLES
-- ==========================================

-- SUBJECTS (Maths, Science etc. per Class)
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    code TEXT, -- e.g. MAT101
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE (class_id, name)
);

-- EXAMS (Midterm, Final etc. per Year/School)
CREATE TABLE IF NOT EXISTS public.exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE (school_id, academic_year_id, name)
);

-- EXAM_SUBJECTS (Linking Exams to Subjects with Max Marks)
CREATE TABLE IF NOT EXISTS public.exam_subjects (
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
    max_marks NUMERIC(5,2) DEFAULT 100.00,
    
    PRIMARY KEY (exam_id, subject_id)
);

-- MARKS (Student results)
CREATE TABLE IF NOT EXISTS public.marks (
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
    
    marks_obtained NUMERIC(5,2) NOT NULL,
    entered_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    entered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    PRIMARY KEY (student_id, exam_id, subject_id)
);

-- ==========================================
-- 2. RLS POLICIES
-- ==========================================

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marks ENABLE ROW LEVEL SECURITY;

-- Helper: Check if user manages exams
CREATE OR REPLACE FUNCTION public.can_manage_exams()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role_id = rp.role_id
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = auth.uid()
    AND p.code IN ('EXAM_CREATE', 'SUBJECT_CREATE')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SUBJECTS
-- View: School users
CREATE POLICY "School users view subjects" ON public.subjects
    FOR SELECT USING (school_id = public.get_my_school_id());

-- Manage: Admin/Head
CREATE POLICY "Admin manage subjects" ON public.subjects
    FOR ALL USING (
        school_id = public.get_my_school_id() AND public.can_manage_exams()
    );

-- EXAMS
-- View: School users
CREATE POLICY "School users view exams" ON public.exams
    FOR SELECT USING (school_id = public.get_my_school_id());

-- Manage: Admin/Head
CREATE POLICY "Admin manage exams" ON public.exams
    FOR ALL USING (
        school_id = public.get_my_school_id() AND public.can_manage_exams()
    );

-- EXAM_SUBJECTS
-- View: School users
CREATE POLICY "School users view exam subjects" ON public.exam_subjects
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.exams e 
            WHERE e.id = public.exam_subjects.exam_id 
            AND e.school_id = public.get_my_school_id()
        )
    );

-- Manage: Admin/Head
CREATE POLICY "Admin manage exam subjects" ON public.exam_subjects
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.exams e 
            WHERE e.id = public.exam_subjects.exam_id 
            AND e.school_id = public.get_my_school_id()
            AND public.can_manage_exams()
        )
    );

-- MARKS
-- View: 
-- 1. Staff (Admin/Faculty) - for simplicity allow viewing all marks in school
CREATE POLICY "Staff view marks" ON public.marks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.students s
            WHERE s.id = public.marks.student_id
            AND s.school_id = public.get_my_school_id()
            AND public.can_view_students() -- Reusing general student view permission
        )
    );

-- 2. Student/Parent - Own marks
CREATE POLICY "Student view own marks" ON public.marks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.students s
            WHERE s.id = public.marks.student_id
            AND (
                s.admission_id IN (SELECT id FROM public.admissions WHERE applicant_user_id = auth.uid()) -- Self (if student user linked)
                OR 
                EXISTS (SELECT 1 FROM public.student_parents sp WHERE sp.student_id = s.id AND sp.parent_user_id = auth.uid()) -- Parent
            )
        )
    );

-- Manage:
-- 1. Faculty (Enter Marks) - Allow insert/update if they are teaching the section or Admin
-- Checking teaching assignment in RLS is expensive but secure.
-- For MVP, we defer strict section check to Backend Logic, and allow "Staff" to insert row-level if they belong to school.
-- Ideally: Join student -> section -> faculty_sections
CREATE POLICY "Staff enter marks" ON public.marks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.students s
            WHERE s.id = public.marks.student_id
            AND s.school_id = public.get_my_school_id()
            AND (public.can_manage_exams() OR public.can_view_students()) -- Broad check, refined in backend
        )
    );
