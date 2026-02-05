-- ==========================================
-- 1. TABLES
-- ==========================================

-- CLASSES (e.g. Grade 1, Grade 10)
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE (school_id, academic_year_id, name)
);

-- SECTIONS (e.g. A, B, C)
CREATE TABLE IF NOT EXISTS public.sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE (class_id, name)
);

-- STUDENT_SECTIONS (Enrollment)
CREATE TABLE IF NOT EXISTS public.student_sections (
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    section_id UUID REFERENCES public.sections(id) ON DELETE CASCADE NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint: A student can theoretically be in multiple sections IF they are different subjects (not scoped here)
    -- BUT requirements say "A student can belong to only one section per academic". 
    -- Since section -> class -> year, enforcing this on DB level requires a trigger or exclude using join.
    -- For now, we enforce uniqueness on student+section for basic integrity.
    -- Uniqueness per year will be handled by Application Logic to allow flexibility (e.g. changing sections).
    PRIMARY KEY (student_id, section_id)
);

-- FACULTY_SECTIONS (Teaching assignment)
CREATE TABLE IF NOT EXISTS public.faculty_sections (
    faculty_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    section_id UUID REFERENCES public.sections(id) ON DELETE CASCADE NOT NULL,
    role TEXT CHECK (role IN ('class_teacher', 'subject_teacher')) DEFAULT 'subject_teacher',
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE (faculty_user_id, section_id)
);

-- ==========================================
-- 2. RLS POLICIES
-- ==========================================

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_sections ENABLE ROW LEVEL SECURITY;

-- HELPER: Check if user manages academic structure
CREATE OR REPLACE FUNCTION public.can_manage_academic()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role_id = rp.role_id
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = auth.uid()
    AND p.code IN ('CLASS_CREATE', 'SECTION_CREATE', 'STUDENT_ASSIGN_SECTION')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- CLASSES POLICIES
-- View: Staff only (for now) + anyone who has a child in it? Simply Staff + Parents/Students via relations later. 
-- For Foundation, let's allow "Auth users in same school" to read classes (needed for dropdowns etc).
CREATE POLICY "School users view classes" ON public.classes
    FOR SELECT USING (school_id = public.get_my_school_id());

-- Manage: Admin/Head
CREATE POLICY "Admin manage classes" ON public.classes
    FOR ALL USING (
        school_id = public.get_my_school_id() AND public.can_manage_academic()
    );

-- SECTIONS POLICIES
-- View: School users
CREATE POLICY "School users view sections" ON public.sections
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.classes c
            WHERE c.id = public.sections.class_id
            AND c.school_id = public.get_my_school_id()
        )
    );

-- Manage: Admin/Head
CREATE POLICY "Admin manage sections" ON public.sections
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.classes c
            WHERE c.id = public.sections.class_id
            AND c.school_id = public.get_my_school_id()
            AND public.can_manage_academic()
        )
    );

-- STUDENT_SECTIONS POLICIES
-- View: Staff + Related Student/Parent
CREATE POLICY "Staff view enrollments" ON public.student_sections
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.students s
            WHERE s.id = public.student_sections.student_id
            AND s.school_id = public.get_my_school_id()
            AND public.can_view_students() -- Re-using student view perm check
        )
    );

CREATE POLICY "Student view own section" ON public.student_sections
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.students s
            WHERE s.id = public.student_sections.student_id
            AND s.admission_id IN (
                SELECT id FROM public.admissions WHERE applicant_user_id = auth.uid() -- if student user linked?
                -- Actually we rely on `student_parents` for parents.
            )
        ) 
        OR 
        EXISTS (
            SELECT 1 FROM public.student_parents sp
            WHERE sp.student_id = public.student_sections.student_id
            AND sp.parent_user_id = auth.uid()
        )
    );

-- Manage: Admin/Head
CREATE POLICY "Admin manage enrollments" ON public.student_sections
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.students s
            WHERE s.id = public.student_sections.student_id
            AND s.school_id = public.get_my_school_id()
            AND public.can_manage_academic()
        )
    );

-- FACULTY_SECTIONS POLICIES
-- View: Staff
CREATE POLICY "Staff view faculty assignments" ON public.faculty_sections
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.sections sec
            JOIN public.classes c ON sec.class_id = c.id
            WHERE sec.id = public.faculty_sections.section_id
            AND c.school_id = public.get_my_school_id()
        )
    );

-- Manage: Admin/Head
CREATE POLICY "Admin manage faculty assignments" ON public.faculty_sections
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.sections sec
            JOIN public.classes c ON sec.class_id = c.id
            WHERE sec.id = public.faculty_sections.section_id
            AND c.school_id = public.get_my_school_id()
            AND public.can_manage_academic()
        )
    );
