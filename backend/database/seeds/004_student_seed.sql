DO $$
DECLARE
    -- Roles
    r_admin UUID;
    r_faculty UUID;
    r_parent UUID;

    -- Permissions
    p_create UUID;
    p_view UUID;
    p_update UUID;
    p_view_self UUID;

BEGIN
    -- 1. Create New Permissions within STUDENT context
    INSERT INTO public.permissions (code, description) VALUES
    ('STUDENT_CREATE', 'Create new student record'),
    ('STUDENT_VIEW', 'View student records'),
    ('STUDENT_UPDATE', 'Update student details'),
    ('STUDENT_VIEW_SELF', 'View own child records')
    ON CONFLICT (code) DO NOTHING;

    -- 2. Role IDs
    SELECT id INTO r_admin FROM public.roles WHERE name = 'ADMIN';
    SELECT id INTO r_faculty FROM public.roles WHERE name = 'FACULTY';
    SELECT id INTO r_parent FROM public.roles WHERE name = 'PARENT';

    -- 3. Map Permissions

    -- ADMIN: Create, View, Update
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT r_admin, id FROM public.permissions 
    WHERE code IN ('STUDENT_CREATE', 'STUDENT_VIEW', 'STUDENT_UPDATE')
    ON CONFLICT DO NOTHING;

    -- FACULTY: View
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT r_faculty, id FROM public.permissions 
    WHERE code = 'STUDENT_VIEW'
    ON CONFLICT DO NOTHING;

    -- PARENT: View Self
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT r_parent, id FROM public.permissions 
    WHERE code = 'STUDENT_VIEW_SELF'
    ON CONFLICT DO NOTHING;

END $$;
