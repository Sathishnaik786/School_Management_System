DO $$
DECLARE
    -- Roles
    r_admin UUID;
    r_parent UUID;
    r_student UUID;

BEGIN
    -- 1. Create permissions
    INSERT INTO public.permissions (code, description) VALUES
    ('TRANSPORT_SETUP', 'Manage transport routes and vehicles'),
    ('TRANSPORT_ASSIGN', 'Assign transport to students'),
    ('TRANSPORT_VIEW', 'View transport details'),
    ('TRANSPORT_VIEW_SELF', 'View own transport details')
    ON CONFLICT (code) DO NOTHING;

    -- 2. Role IDs
    SELECT id INTO r_admin FROM public.roles WHERE name = 'ADMIN';
    SELECT id INTO r_parent FROM public.roles WHERE name = 'PARENT';
    SELECT id INTO r_student FROM public.roles WHERE name = 'STUDENT';

    -- 3. Map Permissions

    -- ADMIN: All
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT r_admin, id FROM public.permissions 
    WHERE code IN ('TRANSPORT_SETUP', 'TRANSPORT_ASSIGN', 'TRANSPORT_VIEW')
    ON CONFLICT DO NOTHING;

    -- PARENT/STUDENT: View Self
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT r_parent, id FROM public.permissions 
    WHERE code IN ('TRANSPORT_VIEW_SELF')
    ON CONFLICT DO NOTHING;
    
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT r_student, id FROM public.permissions 
    WHERE code IN ('TRANSPORT_VIEW_SELF')
    ON CONFLICT DO NOTHING;

END $$;
