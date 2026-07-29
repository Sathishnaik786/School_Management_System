-- ==========================================
-- 1. TABLES
-- ==========================================

-- STUDENTS
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    admission_id UUID REFERENCES public.admissions(id) ON DELETE CASCADE UNIQUE NOT NULL, -- 1:1 mapping
    
    student_code TEXT NOT NULL, -- Unique per school theoretically, handled by app or soft constraint
    full_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
    
    status TEXT CHECK (status IN ('active', 'inactive', 'alumni')) DEFAULT 'active',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE (school_id, student_code)
);

-- STUDENT_PARENTS (Mapping Students to Parent Users)
CREATE TABLE IF NOT EXISTS public.student_parents (
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    parent_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    relation TEXT CHECK (relation IN ('father', 'mother', 'guardian')) DEFAULT 'guardian',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (student_id, parent_user_id)
);

-- ==========================================
-- 2. RLS POLICIES
-- ==========================================

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_parents ENABLE ROW LEVEL SECURITY;

-- Helper: Check if user has Student View permission
CREATE OR REPLACE FUNCTION public.can_view_students()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role_id = rp.role_id
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = auth.uid()
    AND p.code IN ('STUDENT_VIEW', 'STUDENT_CREATE', 'STUDENT_UPDATE')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STUDENTS POLICIES

-- View:
-- 1. Staff (Admin/Faculty) view all in their school
CREATE POLICY "Staff view school students" ON public.students
    FOR SELECT USING (
        school_id = public.get_my_school_id() 
        AND public.can_view_students()
    );

-- 2. Parents view their OWN children
CREATE POLICY "Parents view own children" ON public.students
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.student_parents sp
            WHERE sp.student_id = public.students.id
            AND sp.parent_user_id = auth.uid()
        )
    );

-- Insert/Update: Only Admin/Head (via Backend usually, but RLS for safety)
CREATE POLICY "Admin manage students" ON public.students
    FOR ALL USING (
        school_id = public.get_my_school_id()
        AND public.is_admin() -- Or strictly check 'STUDENT_CREATE' if mapped
    );

-- STUDENT_PARENTS POLICIES

-- View:
-- 1. Staff view
CREATE POLICY "Staff view student parents" ON public.student_parents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.students s
            WHERE s.id = public.student_parents.student_id
            AND s.school_id = public.get_my_school_id()
            AND public.can_view_students()
        )
    );

-- 2. Parents view their own link
CREATE POLICY "Parent view own link" ON public.student_parents
    FOR SELECT USING (
        parent_user_id = auth.uid()
    );

-- Manage: Admin only
CREATE POLICY "Admin manage student parents" ON public.student_parents
    FOR ALL USING (
        public.is_admin()
    );
