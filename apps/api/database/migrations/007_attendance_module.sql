-- ==========================================
-- 1. TABLES
-- ==========================================

-- ATTENDANCE_SESSIONS (Header record for a day/section)
CREATE TABLE IF NOT EXISTS public.attendance_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
    section_id UUID REFERENCES public.sections(id) ON DELETE CASCADE NOT NULL,
    
    date DATE NOT NULL,
    marked_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE (section_id, date)
);

-- ATTENDANCE_RECORDS (Detail records)
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.attendance_sessions(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    
    status TEXT CHECK (status IN ('present', 'absent', 'late', 'excused')) DEFAULT 'present',
    marked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE (session_id, student_id)
);

-- ==========================================
-- 2. RLS POLICIES
-- ==========================================

ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

-- Helper
CREATE OR REPLACE FUNCTION public.can_mark_attendance()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role_id = rp.role_id
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = auth.uid()
    AND p.code IN ('ATTENDANCE_MARK')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SESSIONS
-- View: School users
CREATE POLICY "School users view sessions" ON public.attendance_sessions
    FOR SELECT USING (school_id = public.get_my_school_id());

-- Manage: Faculty/Admin
CREATE POLICY "Staff manage sessions" ON public.attendance_sessions
    FOR ALL USING (
        school_id = public.get_my_school_id() 
        AND public.can_mark_attendance()
    );

-- RECORDS
-- View: 
-- 1. Staff (School level)
CREATE POLICY "Staff view records" ON public.attendance_records
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.attendance_sessions s
            WHERE s.id = public.attendance_records.session_id
            AND s.school_id = public.get_my_school_id()
        )
    );

-- 2. Student/Parent (Own records)
CREATE POLICY "Student view own records" ON public.attendance_records
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.students stu
            WHERE stu.id = public.attendance_records.student_id
            AND (
                 -- Self view if student user
                stu.admission_id IN (SELECT id FROM public.admissions WHERE applicant_user_id = auth.uid()) 
                OR 
                -- Parent view
                EXISTS (SELECT 1 FROM public.student_parents sp WHERE sp.student_id = stu.id AND sp.parent_user_id = auth.uid())
            )
        )
    );

-- Manage: Staff
CREATE POLICY "Staff manage records" ON public.attendance_records
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.attendance_sessions s
            WHERE s.id = public.attendance_records.session_id
            AND s.school_id = public.get_my_school_id()
            AND public.can_mark_attendance()
        )
    );
