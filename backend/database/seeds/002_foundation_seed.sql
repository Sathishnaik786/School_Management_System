DO $$
DECLARE
    s_id UUID;
    y_id UUID;
    r_admin UUID;
    p_id UUID;
    -- Placeholder UUID for the initial Admin. 
    -- ACTION REQUIRED: Create a Supabase Auth User with this ID, OR update this row with your actual Auth ID.
    admin_uuid UUID := '00000000-0000-0000-0000-000000000000'; 
BEGIN
    -- 1. Create School
    INSERT INTO public.schools (name, code, status)
    VALUES ('Greenwood High', 'GWH001', 'active')
    ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO s_id;

    -- 2. Create Academic Year
    INSERT INTO public.academic_years (school_id, year_label, is_active)
    VALUES (s_id, ' 2026-2026', true)
    ON CONFLICT DO NOTHING;

    -- 3. Ensure Roles
    INSERT INTO public.roles (name, description) VALUES
    ('ADMIN', 'School Admin'),
    ('HEAD_OF_INSTITUTE', 'Principal'),
    ('FACULTY', 'Teacher'),
    ('PARENT', 'Parent'),
    ('STUDENT', 'Student')
    ON CONFLICT (name) DO NOTHING;

    SELECT id INTO r_admin FROM public.roles WHERE name = 'ADMIN';

    -- 4. Ensure Permissions
    INSERT INTO public.permissions (code, description) VALUES
    ('ADMISSION_REVIEW', 'Review admission applications'),
    ('STUDENT_VIEW', 'View student details'),
    ('PAYMENT_MANAGE', 'Manage payments'),
    ('SCHOOL_SETTINGS', 'Manage school settings')
    ON CONFLICT (code) DO NOTHING;

    -- 5. Assign Permissions to ADMIN ROLE
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT r_admin, id FROM public.permissions
    ON CONFLICT DO NOTHING;

    -- 6. Seed Admin Profile (Linked to the School)
    -- This allows the user to log in once they create the Auth User with this ID (or update this row)
    INSERT INTO public.users (id, school_id, full_name, email, status)
    VALUES (admin_uuid, s_id, 'System Admin', 'admin@greenwood.high', 'active')
    ON CONFLICT (id) DO UPDATE SET school_id = EXCLUDED.school_id;

    -- 7. Assign ADMIN Role to the Admin User
    INSERT INTO public.user_roles (user_id, role_id)
    VALUES (admin_uuid, r_admin)
    ON CONFLICT (user_id, role_id) DO NOTHING;

END $$;
