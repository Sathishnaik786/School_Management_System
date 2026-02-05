-- ==========================================
-- 014_admission_module_v2.sql
-- Enhancing the Admission Module for production-grade workflows
-- ==========================================

-- 1. ENHANCE ADMISSIONS TABLE
-- We add more fields for a complete application profile
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admissions' AND column_name = 'parent_name') THEN
        ALTER TABLE public.admissions ADD COLUMN parent_name TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admissions' AND column_name = 'parent_email') THEN
        ALTER TABLE public.admissions ADD COLUMN parent_email TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admissions' AND column_name = 'parent_phone') THEN
        ALTER TABLE public.admissions ADD COLUMN parent_phone TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admissions' AND column_name = 'address') THEN
        ALTER TABLE public.admissions ADD COLUMN address TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admissions' AND column_name = 'previous_school') THEN
        ALTER TABLE public.admissions ADD COLUMN previous_school TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admissions' AND column_name = 'last_grade_completed') THEN
        ALTER TABLE public.admissions ADD COLUMN last_grade_completed TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admissions' AND column_name = 'remark_by_officer') THEN
        ALTER TABLE public.admissions ADD COLUMN remark_by_officer TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admissions' AND column_name = 'remark_by_hoi') THEN
        ALTER TABLE public.admissions ADD COLUMN remark_by_hoi TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admissions' AND column_name = 'recommended_at') THEN
        ALTER TABLE public.admissions ADD COLUMN recommended_at TIMESTAMP WITH TIME ZONE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admissions' AND column_name = 'approved_at') THEN
        ALTER TABLE public.admissions ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admissions' AND column_name = 'rejected_at') THEN
        ALTER TABLE public.admissions ADD COLUMN rejected_at TIMESTAMP WITH TIME ZONE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admissions' AND column_name = 'rejection_reason') THEN
        ALTER TABLE public.admissions ADD COLUMN rejection_reason TEXT;
    END IF;
END $$;

-- Update status constraint
ALTER TABLE public.admissions DROP CONSTRAINT IF EXISTS admissions_status_check;
ALTER TABLE public.admissions ADD CONSTRAINT admissions_status_check 
CHECK (status IN ('draft', 'submitted', 'under_review', 'recommended', 'approved', 'rejected', 'enrolled'));

-- 2. ROLES & PERMISSIONS
-- Ensure Roles
INSERT INTO public.roles (name, description)
VALUES 
    ('PARENT', 'Parent/Guardian for admissions'),
    ('ADMISSION_OFFICER', 'Staff responsible for reviewing applications'),
    ('HOI', 'Head of Institute for final approval')
ON CONFLICT (name) DO NOTHING;

-- Ensure Permissions
INSERT INTO public.permissions (code, description)
VALUES 
    ('admission.create', 'Create a new admission application'),
    ('admission.view_own', 'View own admission applications'),
    ('admission.view_all', 'View all admission applications in the school'),
    ('admission.review', 'Review and move application to under_review'),
    ('admission.recommend', 'Recommend application to HOI'),
    ('admission.approve', 'Final approval of application'),
    ('admission.reject', 'Reject an application'),
    ('admission.enrol', 'Enrol approved applicant as student')
ON CONFLICT (code) DO NOTHING;

-- Map Permissions to Roles
-- ADMISSION_OFFICER
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM public.roles r, public.permissions p
WHERE r.name = 'ADMISSION_OFFICER' AND p.code IN ('admission.view_all', 'admission.review', 'admission.recommend', 'admission.reject')
ON CONFLICT DO NOTHING;

-- HOI
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM public.roles r, public.permissions p
WHERE r.name = 'HOI' AND p.code IN ('admission.view_all', 'admission.approve', 'admission.reject')
ON CONFLICT DO NOTHING;

-- PARENT
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM public.roles r, public.permissions p
WHERE r.name = 'PARENT' AND p.code IN ('admission.create', 'admission.view_own')
ON CONFLICT DO NOTHING;

-- ADMIN
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM public.roles r, public.permissions p
WHERE r.name = 'ADMIN' AND p.code LIKE 'admission.%'
ON CONFLICT DO NOTHING;

-- 3. NEW POLICIES (Updating existing ones effectively)
DROP POLICY IF EXISTS "Staff view school admissions" ON public.admissions;
CREATE POLICY "Staff view school admissions" ON public.admissions
    FOR SELECT USING (
        school_id = public.get_my_school_id() 
        AND (public.has_permission('admission.view_all') OR public.is_admin())
    );

DROP POLICY IF EXISTS "Staff update status" ON public.admissions;
CREATE POLICY "Staff update status" ON public.admissions
    FOR UPDATE USING (
        school_id = public.get_my_school_id() 
        AND (
            public.has_permission('admission.review') OR 
            public.has_permission('admission.recommend') OR 
            public.has_permission('admission.approve') OR 
            public.has_permission('admission.reject') OR
            public.is_admin()
        )
    );

-- 4. AUTO-ACTION: Move to student table on ENROLLED status (Logical/Simplified)
-- In a real system, this might be a complex trigger or handled in backend service.
-- We'll handle refined student creation in the backend service for better control.
