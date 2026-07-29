-- ==========================================
-- 1. TABLES
-- ==========================================

-- TIMETABLE_SLOTS
CREATE TABLE IF NOT EXISTS public.timetable_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
    section_id UUID REFERENCES public.sections(id) ON DELETE CASCADE NOT NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
    faculty_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    
    day_of_week INTEGER CHECK (day_of_week BETWEEN 1 AND 7) NOT NULL, -- 1=Monday, 7=Sunday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT check_time_order CHECK (end_time > start_time)
);

-- Note: Overlap constraints are handled via Application Logic to avoid 'btree_gist' dependency which requires superuser.

-- ==========================================
-- 2. RLS POLICIES
-- ==========================================

ALTER TABLE public.timetable_slots ENABLE ROW LEVEL SECURITY;

-- Helper
CREATE OR REPLACE FUNCTION public.can_manage_timetable()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role_id = rp.role_id
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = auth.uid()
    AND p.code IN ('TIMETABLE_CREATE')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- VIEW POLICIES
-- 1. School Users (Staff) can view generally (needed for overlap checks or general view)
CREATE POLICY "School users view timetable" ON public.timetable_slots
    FOR SELECT USING (school_id = public.get_my_school_id());

-- 2. Students/Parents view their OWN section slots
CREATE POLICY "Student view own section timetable" ON public.timetable_slots
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.students s
            LEFT JOIN public.student_sections ss ON s.id = ss.student_id
            WHERE ss.section_id = public.timetable_slots.section_id
            AND (
                -- Student Self
                s.admission_id IN (SELECT id FROM public.admissions WHERE applicant_user_id = auth.uid()) 
                OR 
                -- Parent
                EXISTS (SELECT 1 FROM public.student_parents sp WHERE sp.student_id = s.id AND sp.parent_user_id = auth.uid())
            )
        )
    );

-- MANAGE POLICIES
CREATE POLICY "Admin manage timetable" ON public.timetable_slots
    FOR ALL USING (
        school_id = public.get_my_school_id() 
        AND public.can_manage_timetable()
    );
