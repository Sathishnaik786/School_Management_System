DO $$
DECLARE
    -- Roles
    r_admin UUID;
    r_faculty UUID;
    r_parent UUID;
    r_student UUID;

BEGIN
    -- 1. Create New Permissions
    INSERT INTO public.permissions (code, description) VALUES
    ('ATTENDANCE_MARK', 'Mark attendance'),
    ('ATTENDANCE_VIEW', 'View attendance'),
    ('ATTENDANCE_VIEW_SELF', 'View own attendance')
    ON CONFLICT (code) DO NOTHING;

    -- 2. Role IDs
    SELECT id INTO r_admin FROM public.roles WHERE name = 'ADMIN';
    SELECT id INTO r_faculty FROM public.roles WHERE name = 'FACULTY';
    SELECT id INTO r_parent FROM public.roles WHERE name = 'PARENT';
    SELECT id INTO r_student FROM public.roles WHERE name = 'STUDENT';

    -- 3. Map Permissions

    -- ADMIN: View (Usually doesn't mark, but let's give Mark ability too for overrides)
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT r_admin, id FROM public.permissions 
    WHERE code IN ('ATTENDANCE_MARK', 'ATTENDANCE_VIEW')
    ON CONFLICT DO NOTHING;

    -- FACULTY: Mark, View
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT r_faculty, id FROM public.permissions 
    WHERE code IN ('ATTENDANCE_MARK', 'ATTENDANCE_VIEW')
    ON CONFLICT DO NOTHING;

    -- PARENT / STUDENT: View Self
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT r_id, p.id 
    FROM (SELECT id as r_id FROM public.roles WHERE id IN (r_parent, r_student)) as roles_sub
    CROSS JOIN public.permissions p
    WHERE p.code IN ('ATTENDANCE_VIEW_SELF')
    ON CONFLICT DO NOTHING;

END $$;
