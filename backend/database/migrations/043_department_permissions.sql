-- Migration: 043_department_permissions.sql
-- Description: Add permissions for Department Management

DO $$
DECLARE
    role_admin_id UUID;
    role_sa_id UUID;
BEGIN
    -- Get Role IDs
    SELECT id INTO role_admin_id FROM public.roles WHERE name = 'ADMIN';
    SELECT id INTO role_sa_id FROM public.roles WHERE name = 'SUPER_ADMIN';

    -- 1. Insert Permissions (if not exist)
    INSERT INTO public.permissions (code, description)
    VALUES 
    ('DEPARTMENT_VIEW', 'View departments list'),
    ('DEPARTMENT_CREATE', 'Create new department'),
    ('DEPARTMENT_UPDATE', 'Update department details'),
    ('DEPARTMENT_DELETE', 'Delete department')
    ON CONFLICT (code) DO NOTHING;

    -- 2. Assign to ADMIN
    IF role_admin_id IS NOT NULL THEN
        INSERT INTO public.role_permissions (role_id, permission_id)
        SELECT role_admin_id, id FROM public.permissions WHERE code IN ('DEPARTMENT_VIEW', 'DEPARTMENT_CREATE', 'DEPARTMENT_UPDATE', 'DEPARTMENT_DELETE')
        ON CONFLICT (role_id, permission_id) DO NOTHING;
    END IF;

    -- 3. Assign to SUPER_ADMIN
    IF role_sa_id IS NOT NULL THEN
        INSERT INTO public.role_permissions (role_id, permission_id)
        SELECT role_sa_id, id FROM public.permissions WHERE code IN ('DEPARTMENT_VIEW', 'DEPARTMENT_CREATE', 'DEPARTMENT_UPDATE', 'DEPARTMENT_DELETE')
        ON CONFLICT (role_id, permission_id) DO NOTHING;
    END IF;

END $$;
