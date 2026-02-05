-- ==========================================
-- 022_academic_automation.sql
-- Academic Assignment Automation System
-- ==========================================

-- 1. ROLES & PERMISSIONS
INSERT INTO public.roles (name, description) 
VALUES ('ACADEMIC_COORDINATOR', 'Can manage faculty and section assignments')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.permissions (code, description) VALUES
('ACADEMIC_ASSIGN_FACULTY', 'Assign faculty to sections'),
('ACADEMIC_REMOVE_FACULTY', 'Remove faculty from sections'),
('ACADEMIC_VIEW_ASSIGNMENTS', 'View all faculty-student assignments')
ON CONFLICT (code) DO NOTHING;

-- Map permissions to ADMIN and ACADEMIC_COORDINATOR
DO $$
DECLARE
    admin_id UUID;
    coord_id UUID;
BEGIN
    SELECT id INTO admin_id FROM public.roles WHERE name = 'ADMIN';
    SELECT id INTO coord_id FROM public.roles WHERE name = 'ACADEMIC_COORDINATOR';
    
    -- Admin Permissions
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT admin_id, id FROM public.permissions WHERE code LIKE 'ACADEMIC_%'
    ON CONFLICT DO NOTHING;

    -- Coordinator Permissions
    IF coord_id IS NOT NULL THEN
        INSERT INTO public.role_permissions (role_id, permission_id)
        SELECT coord_id, id FROM public.permissions WHERE code LIKE 'ACADEMIC_%'
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- 2. TABLES

-- 2.1 SECTION_FACULTY_ASSIGNMENTS
CREATE TABLE IF NOT EXISTS public.section_faculty_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_id UUID REFERENCES public.sections(id) ON DELETE CASCADE NOT NULL,
    faculty_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
    
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status TEXT CHECK (status IN ('ACTIVE', 'INACTIVE')) DEFAULT 'ACTIVE',
    
    UNIQUE (section_id, faculty_id, academic_year_id, status)
);

-- 2.2 STUDENT_FACULTY_ASSIGNMENTS
CREATE TABLE IF NOT EXISTS public.student_faculty_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    faculty_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    section_id UUID REFERENCES public.sections(id) ON DELETE CASCADE NOT NULL,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
    
    source TEXT CHECK (source IN ('SECTION_AUTO', 'MANUAL_OVERRIDE')) DEFAULT 'SECTION_AUTO',
    status TEXT CHECK (status IN ('ACTIVE', 'INACTIVE')) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE (student_id, faculty_id, academic_year_id)
);

-- 3. RLS POLICIES
ALTER TABLE public.section_faculty_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_faculty_assignments ENABLE ROW LEVEL SECURITY;

-- VIEW: Everyone in school can view (for context)
CREATE POLICY "View section faculty assignments" ON public.section_faculty_assignments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.sections s
            JOIN public.classes c ON s.class_id = c.id
            WHERE s.id = section_faculty_assignments.section_id
            AND c.school_id = public.get_my_school_id()
        )
    );

-- MANAGE: Admin / Coordinator
CREATE POLICY "Manage section faculty assignments" ON public.section_faculty_assignments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON ur.role_id = r.id
            JOIN public.role_permissions rp ON r.id = rp.role_id
            JOIN public.permissions p ON rp.permission_id = p.id
            WHERE ur.user_id = auth.uid()
            AND p.code = 'ACADEMIC_ASSIGN_FACULTY'
        )
    );

-- STUDENT_FACULTY_ASSIGNMENTS VIEW
-- Faculty view own students
-- Parent/Student view own faculty
CREATE POLICY "Faculty view own student assignments" ON public.student_faculty_assignments
    FOR SELECT USING (faculty_id = auth.uid());

CREATE POLICY "Student/Parent view faculty" ON public.student_faculty_assignments
    FOR SELECT USING (
        student_id IN (
            SELECT id FROM public.students WHERE admission_id IN (
                SELECT id FROM public.admissions WHERE applicant_user_id = auth.uid()
            )
        ) OR EXISTS (
            SELECT 1 FROM public.student_parents sp WHERE sp.student_id = student_faculty_assignments.student_id AND sp.parent_user_id = auth.uid()
        )
    );

CREATE POLICY "Admin view all student faculty mappings" ON public.student_faculty_assignments
    FOR SELECT USING (public.is_admin());

-- 4. AUTOMATION LOGGING (Audit Logs Enhancement)
-- Reusing existing audit logic or creating a specific one if needed.
-- Requirements: FACULTY_ASSIGNED_TO_SECTION, STUDENTS_AUTO_ASSIGNED_TO_FACULTY, etc.

CREATE TABLE IF NOT EXISTS public.academic_automation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    action TEXT NOT NULL, -- e.g., FACULTY_ASSIGNED_TO_SECTION
    details JSONB,
    performed_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.academic_automation_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin view logs" ON public.academic_automation_logs FOR SELECT USING (public.is_admin());

-- 5. RPC FOR ATOMIC OPERATIONS
CREATE OR REPLACE FUNCTION public.fn_assign_faculty_to_section(
    p_section_id UUID,
    p_faculty_id UUID,
    p_academic_year_id UUID,
    p_assigned_by UUID
) RETURNS VOID AS $$
BEGIN
    -- 1. Upsert Section-Faculty link
    INSERT INTO public.section_faculty_assignments (section_id, faculty_id, academic_year_id, assigned_by, status)
    VALUES (p_section_id, p_faculty_id, p_academic_year_id, p_assigned_by, 'ACTIVE')
    ON CONFLICT (section_id, faculty_id, academic_year_id, status) 
    DO UPDATE SET assigned_at = NOW(), assigned_by = p_assigned_by;

    -- 2. Auto-map all students in that section
    INSERT INTO public.student_faculty_assignments (student_id, faculty_id, section_id, academic_year_id, source, status)
    SELECT student_id, p_faculty_id, section_id, p_academic_year_id, 'SECTION_AUTO', 'ACTIVE'
    FROM public.student_sections
    WHERE section_id = p_section_id
    ON CONFLICT (student_id, faculty_id, academic_year_id) 
    DO UPDATE SET status = 'ACTIVE', updated_at = NOW();

    -- 3. Log
    INSERT INTO public.academic_automation_logs (action, details, performed_by)
    VALUES ('FACULTY_ASSIGNED_TO_SECTION', jsonb_build_object('section_id', p_section_id, 'faculty_id', p_faculty_id), p_assigned_by);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.fn_sync_student_with_faculty(
    p_student_id UUID,
    p_section_id UUID,
    p_academic_year_id UUID
) RETURNS VOID AS $$
BEGIN
    INSERT INTO public.student_faculty_assignments (student_id, faculty_id, section_id, academic_year_id, source, status)
    SELECT p_student_id, faculty_id, p_section_id, p_academic_year_id, 'SECTION_AUTO', 'ACTIVE'
    FROM public.section_faculty_assignments
    WHERE section_id = p_section_id AND status = 'ACTIVE'
    ON CONFLICT (student_id, faculty_id, academic_year_id)
    DO UPDATE SET status = 'ACTIVE', updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

