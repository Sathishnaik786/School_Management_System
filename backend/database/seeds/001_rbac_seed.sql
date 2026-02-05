DO $$
DECLARE
    -- Role IDs
    r_admin UUID;
    r_faculty UUID;
    r_parent UUID;
    r_student UUID;
    r_transport UUID;
    r_counsellor UUID;
BEGIN
    -- ==========================================
    -- 1. INSERT ROLES
    -- ==========================================
    INSERT INTO public.roles (name, description) VALUES
    ('ADMIN', 'System Administrator with full access'),
    ('FACULTY', 'Teaching staff'),
    ('PARENT', 'Parent or Guardian'),
    ('STUDENT', 'Enrolled Student'),
    ('TRANSPORT_ADMIN', 'Manages fleet and routes'),
    ('COUNSELLOR', 'Student guidance counsellor')
    ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

    -- Retrieve IDs for mapping
    SELECT id INTO r_admin FROM public.roles WHERE name = 'ADMIN';
    SELECT id INTO r_faculty FROM public.roles WHERE name = 'FACULTY';
    SELECT id INTO r_parent FROM public.roles WHERE name = 'PARENT';
    SELECT id INTO r_student FROM public.roles WHERE name = 'STUDENT';

    -- ==========================================
    -- 2. INSERT PERMISSIONS
    -- ==========================================
    INSERT INTO public.permissions (code, description) VALUES
    ('admission.create', 'Create new admission applications'),
    ('admission.review', 'Review and approve admissions'),
    ('student.read', 'View student profiles'),
    ('student.update', 'Update student details'),
    ('exam.create', 'Create new exams'),
    ('exam.publish', 'Publish exam results'),
    ('payment.collect', 'Collect fees and payments'),
    ('transport.assign', 'Assign students to routes')
    ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description;

    -- ==========================================
    -- 3. MAP PERMISSIONS TO ROLES
    -- ==========================================

    -- ADMIN: Gets ALL permissions
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT r_admin, id FROM public.permissions
    ON CONFLICT (role_id, permission_id) DO NOTHING;

    -- FACULTY: student.read, exam.create
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT r_faculty, id FROM public.permissions 
    WHERE code IN ('student.read', 'exam.create')
    ON CONFLICT (role_id, permission_id) DO NOTHING;

    -- PARENT: student.read
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT r_parent, id FROM public.permissions 
    WHERE code = 'student.read'
    ON CONFLICT (role_id, permission_id) DO NOTHING;

    -- STUDENT: student.read
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT r_student, id FROM public.permissions 
    WHERE code = 'student.read'
    ON CONFLICT (role_id, permission_id) DO NOTHING;

END $$;
