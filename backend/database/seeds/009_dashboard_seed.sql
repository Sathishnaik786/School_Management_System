DO $$
DECLARE
    -- Roles
    r_admin UUID;
    r_faculty UUID;
    r_parent UUID;

BEGIN
    -- 1. Create permissions
    INSERT INTO public.permissions (code, description) VALUES
    ('DASHBOARD_VIEW_ADMIN', 'View Admin Dashboard'),
    ('DASHBOARD_VIEW_FACULTY', 'View Faculty Dashboard'),
    ('DASHBOARD_VIEW_PARENT', 'View Parent/Student Dashboard')
    ON CONFLICT (code) DO NOTHING;

    -- 2. Role IDs
    SELECT id INTO r_admin FROM public.roles WHERE name = 'ADMIN';
    SELECT id INTO r_faculty FROM public.roles WHERE name = 'FACULTY';
    SELECT id INTO r_parent FROM public.roles WHERE name = 'PARENT';

    -- 3. Map Permissions
    
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT r_admin, id FROM public.permissions WHERE code = 'DASHBOARD_VIEW_ADMIN'
    ON CONFLICT DO NOTHING;

    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT r_faculty, id FROM public.permissions WHERE code = 'DASHBOARD_VIEW_FACULTY'
    ON CONFLICT DO NOTHING;

    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT r_parent, id FROM public.permissions WHERE code = 'DASHBOARD_VIEW_PARENT'
    ON CONFLICT DO NOTHING;

    -- Also give Student the Parent dashboard perm for now (Shared 'My Dashboard')
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT id, (SELECT id FROM public.permissions WHERE code = 'DASHBOARD_VIEW_PARENT')
    FROM public.roles WHERE name = 'STUDENT'
    ON CONFLICT DO NOTHING;

END $$;
