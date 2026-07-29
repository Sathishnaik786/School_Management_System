DO $$
DECLARE
    -- Roles (Fetch existing)
    r_admin UUID;
    r_faculty UUID;
    r_parent UUID;
    r_student UUID;

BEGIN
    -- 1. Create New Permissions
    INSERT INTO public.permissions (code, description) VALUES
    ('SUBJECT_CREATE', 'Create subjects'),
    ('SUBJECT_VIEW', 'View subjects'),
    ('EXAM_CREATE', 'Create exams'),
    ('EXAM_VIEW', 'View exams'),
    ('MARKS_ENTER', 'Enter student marks'),
    ('MARKS_VIEW', 'View student marks')
    ON CONFLICT (code) DO NOTHING;

    -- 2. Role IDs
    SELECT id INTO r_admin FROM public.roles WHERE name = 'ADMIN';
    SELECT id INTO r_faculty FROM public.roles WHERE name = 'FACULTY';
    SELECT id INTO r_parent FROM public.roles WHERE name = 'PARENT';
    SELECT id INTO r_student FROM public.roles WHERE name = 'STUDENT';

    -- 3. Map Permissions

    -- ADMIN: All
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT r_admin, id FROM public.permissions 
    WHERE code IN ('SUBJECT_CREATE', 'SUBJECT_VIEW', 'EXAM_CREATE', 'EXAM_VIEW', 'MARKS_ENTER', 'MARKS_VIEW')
    ON CONFLICT DO NOTHING;

    -- FACULTY: View Subs/Exams + Enter Marks
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT r_faculty, id FROM public.permissions 
    WHERE code IN ('SUBJECT_VIEW', 'EXAM_VIEW', 'MARKS_ENTER', 'MARKS_VIEW')
    ON CONFLICT DO NOTHING;

    -- PARENT / STUDENT: View Marks
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT r_id, p.id 
    FROM (SELECT id as r_id FROM public.roles WHERE id IN (r_parent, r_student)) as roles_sub
    CROSS JOIN public.permissions p
    WHERE p.code IN ('MARKS_VIEW', 'EXAM_VIEW')
    ON CONFLICT DO NOTHING;

END $$;
