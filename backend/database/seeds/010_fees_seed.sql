DO $$
DECLARE
    -- Roles
    r_admin UUID;
    r_faculty UUID;
    r_parent UUID;

BEGIN
    -- 1. Create permissions
    INSERT INTO public.permissions (code, description) VALUES
    ('FEES_SETUP', 'Create fee structures'),
    ('FEES_ASSIGN', 'Assign fees to students'),
    ('FEES_VIEW', 'View fees'),
    ('PAYMENT_RECORD', 'Record payments'),
    ('PAYMENT_VIEW_SELF', 'View own payments')
    ON CONFLICT (code) DO NOTHING;

    -- 2. Role IDs
    SELECT id INTO r_admin FROM public.roles WHERE name = 'ADMIN';
    SELECT id INTO r_faculty FROM public.roles WHERE name = 'FACULTY';
    SELECT id INTO r_parent FROM public.roles WHERE name = 'PARENT';

    -- 3. Map Permissions

    -- ADMIN: All Fee Perms
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT r_admin, id FROM public.permissions 
    WHERE code IN ('FEES_SETUP', 'FEES_ASSIGN', 'FEES_VIEW', 'PAYMENT_RECORD')
    ON CONFLICT DO NOTHING;

    -- FACULTY: View Only (Maybe check dues)
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT r_faculty, id FROM public.permissions 
    WHERE code IN ('FEES_VIEW')
    ON CONFLICT DO NOTHING;

    -- PARENT: View Self
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT r_parent, id FROM public.permissions 
    WHERE code IN ('PAYMENT_VIEW_SELF')
    ON CONFLICT DO NOTHING;

    -- STUDENT: View Self (Same as Parent)
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT id, (SELECT id FROM public.permissions WHERE code = 'PAYMENT_VIEW_SELF')
    FROM public.roles WHERE name = 'STUDENT'
    ON CONFLICT DO NOTHING;

END $$;
