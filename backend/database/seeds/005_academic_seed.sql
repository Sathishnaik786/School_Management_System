DO $$
DECLARE
    -- Roles
    r_admin UUID;
    r_faculty UUID;
    r_head UUID;

    -- Permissions
    p_class_create UUID;
    p_class_view UUID;
    p_sec_create UUID;
    p_sec_view UUID;
    p_stu_assign UUID;
    p_fac_assign UUID;

BEGIN
    -- 1. Create New Permissions
    INSERT INTO public.permissions (code, description) VALUES
    ('CLASS_CREATE', 'Create classes/grades'),
    ('CLASS_VIEW', 'View classes/grades'),
    ('SECTION_CREATE', 'Create sections'),
    ('SECTION_VIEW', 'View sections'),
    ('STUDENT_ASSIGN_SECTION', 'Assign students to sections'),
    ('FACULTY_ASSIGN_SECTION', 'Assign faculty to sections')
    ON CONFLICT (code) DO NOTHING;

    -- 2. Role IDs
    SELECT id INTO r_admin FROM public.roles WHERE name = 'ADMIN';
    SELECT id INTO r_faculty FROM public.roles WHERE name = 'FACULTY';
    SELECT id INTO r_head FROM public.roles WHERE name = 'HEAD_OF_INSTITUTE';

    -- 3. Map Permissions

    -- ADMIN & HEAD: All Academic permissions
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT r_id, p.id 
    FROM (SELECT id as r_id FROM public.roles WHERE name IN ('ADMIN', 'HEAD_OF_INSTITUTE')) as roles_sub
    CROSS JOIN public.permissions p
    WHERE p.code IN ('CLASS_CREATE', 'CLASS_VIEW', 'SECTION_CREATE', 'SECTION_VIEW', 'STUDENT_ASSIGN_SECTION', 'FACULTY_ASSIGN_SECTION')
    ON CONFLICT DO NOTHING;

    -- FACULTY: View Only
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT r_faculty, id FROM public.permissions 
    WHERE code IN ('CLASS_VIEW', 'SECTION_VIEW')
    ON CONFLICT DO NOTHING;

END $$;
