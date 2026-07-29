-- Seeding Demo Users for all roles
-- School: Greenwood High (GWH001)
-- Password: Welcome#321 (Dynamically BCrypt encrypted using gen_salt)

DO $$
DECLARE
    v_school_id UUID;
    v_academic_year_id UUID;
    v_admin_role UUID;
    v_faculty_role UUID;
    v_student_role UUID;
    v_parent_role UUID;
    v_hoi_role UUID;
    v_coordinator_role UUID;
    v_transport_role UUID;
    v_admission_role UUID;
    
    -- Static UUIDs to ensure reproducible and reliable linking (Valid Hexadecimal)
    u_admin UUID             := 'a1111111-1111-1111-1111-111111111111';
    u_faculty UUID           := 'f2222222-2222-2222-2222-222222222222';
    u_student UUID           := 'e3333333-3333-3333-3333-333333333333';
    u_parent UUID            := 'e4444444-4444-4444-4444-444444444444';
    u_hoi UUID               := 'e5555555-5555-5555-5555-555555555555';
    u_coordinator UUID       := 'c6666666-6666-6666-6666-666666666666';
    u_transportadmin UUID    := 'e7777777-7777-7777-7777-777777777777';
    u_admissionofficer UUID  := 'd8888888-8888-8888-8888-888888888888';
    
    -- Student linkage UUIDs
    u_admission_id UUID      := 'e9999999-9999-9999-9999-999999999999';
    u_student_rec_id UUID    := 'a0000000-0000-0000-0000-000000000000';
    
    v_encrypted_password TEXT;
BEGIN
    -- 1. Fetch Greenwood High and Active Year
    SELECT id INTO v_school_id FROM public.schools WHERE code = 'GWH001';
    IF v_school_id IS NULL THEN
        RAISE EXCEPTION 'MASTER_SCHOOL_NOT_FOUND: Greenwood High school record missing.';
    END IF;
    
    SELECT id INTO v_academic_year_id FROM public.academic_years WHERE school_id = v_school_id LIMIT 1;

    -- 2. Fetch Role IDs
    SELECT id INTO v_admin_role FROM public.roles WHERE name = 'ADMIN';
    SELECT id INTO v_faculty_role FROM public.roles WHERE name = 'FACULTY';
    SELECT id INTO v_student_role FROM public.roles WHERE name = 'STUDENT';
    SELECT id INTO v_parent_role FROM public.roles WHERE name = 'PARENT';
    SELECT id INTO v_hoi_role FROM public.roles WHERE name = 'HEAD_OF_INSTITUTE';
    SELECT id INTO v_coordinator_role FROM public.roles WHERE name = 'ACADEMIC_COORDINATOR';
    SELECT id INTO v_transport_role FROM public.roles WHERE name = 'TRANSPORT_ADMIN';
    SELECT id INTO v_admission_role FROM public.roles WHERE name = 'ADMISSION_OFFICER';

    -- 3. Calculate Crypt Hash for Welcome#321
    v_encrypted_password := crypt('Welcome#321', gen_salt('bf', 10));

    -- ==========================================
    -- 4. SEED AUTH.USERS (Supabase Authentication Engine)
    -- ==========================================
    
    -- Admin
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role)
    VALUES (u_admin, 'admin@edu.in', v_encrypted_password, now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, 'authenticated', 'authenticated')
    ON CONFLICT (id) DO NOTHING;
    
    -- Faculty
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role)
    VALUES (u_faculty, 'faculty@edu.in', v_encrypted_password, now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, 'authenticated', 'authenticated')
    ON CONFLICT (id) DO NOTHING;
    
    -- Student
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role)
    VALUES (u_student, 'student@edu.in', v_encrypted_password, now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, 'authenticated', 'authenticated')
    ON CONFLICT (id) DO NOTHING;
    
    -- Parent
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role)
    VALUES (u_parent, 'parent@edu.in', v_encrypted_password, now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, 'authenticated', 'authenticated')
    ON CONFLICT (id) DO NOTHING;
    
    -- HOI
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role)
    VALUES (u_hoi, 'hoi@edu.in', v_encrypted_password, now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, 'authenticated', 'authenticated')
    ON CONFLICT (id) DO NOTHING;
    
    -- Coordinator
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role)
    VALUES (u_coordinator, 'coordinator@edu.in', v_encrypted_password, now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, 'authenticated', 'authenticated')
    ON CONFLICT (id) DO NOTHING;
    
    -- Transport Admin
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role)
    VALUES (u_transportadmin, 'transportadmin@edu.in', v_encrypted_password, now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, 'authenticated', 'authenticated')
    ON CONFLICT (id) DO NOTHING;
    
    -- Admission Officer
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role)
    VALUES (u_admissionofficer, 'admissionofficer@edu.in', v_encrypted_password, now(), '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, 'authenticated', 'authenticated')
    ON CONFLICT (id) DO NOTHING;

    -- ==========================================
    -- 5. SEED PUBLIC.USERS (Profiles)
    -- ==========================================
    
    INSERT INTO public.users (id, school_id, full_name, email, status) VALUES
    (u_admin, v_school_id, 'System Admin', 'admin@edu.in', 'active'),
    (u_faculty, v_school_id, 'Sarah Jenkins (Faculty)', 'faculty@edu.in', 'active'),
    (u_student, v_school_id, 'Alex Vance (Student)', 'student@edu.in', 'active'),
    (u_parent, v_school_id, 'Robert Vance (Parent)', 'parent@edu.in', 'active'),
    (u_hoi, v_school_id, 'Dr. Arthur Principal (Principal)', 'hoi@edu.in', 'active'),
    (u_coordinator, v_school_id, 'Helen Keller (Coordinator)', 'coordinator@edu.in', 'active'),
    (u_transportadmin, v_school_id, 'Marcus Wheel (Transport)', 'transportadmin@edu.in', 'active'),
    (u_admissionofficer, v_school_id, 'Nancy Gates (Admissions)', 'admissionofficer@edu.in', 'active')
    ON CONFLICT (id) DO UPDATE SET school_id = EXCLUDED.school_id;

    -- ==========================================
    -- 6. MAP USER ROLES
    -- ==========================================
    
    INSERT INTO public.user_roles (user_id, role_id) VALUES
    (u_admin, v_admin_role),
    (u_faculty, v_faculty_role),
    (u_student, v_student_role),
    (u_parent, v_parent_role),
    (u_hoi, v_hoi_role),
    (u_coordinator, v_coordinator_role),
    (u_transportadmin, v_transport_role),
    (u_admissionofficer, v_admission_role)
    ON CONFLICT (user_id, role_id) DO NOTHING;

    -- ==========================================
    -- 7. BUILD STUDENT & PARENT PROFILE RELATION LINKS
    -- ==========================================
    
    -- A. Seed Mock Admission
    IF v_academic_year_id IS NOT NULL THEN
        INSERT INTO public.admissions (id, school_id, academic_year_id, applicant_user_id, student_name, date_of_birth, gender, grade_applied_for, status)
        VALUES (u_admission_id, v_school_id, v_academic_year_id, u_student, 'Alex Vance', '2012-05-15', 'Male', 'Grade 6', 'enrolled')
        ON CONFLICT (id) DO NOTHING;
        
        -- B. Seed Mock Student Profile (Linked to the Admission)
        INSERT INTO public.students (id, school_id, admission_id, student_code, full_name, date_of_birth, gender, status)
        VALUES (u_student_rec_id, v_school_id, u_admission_id, 'STU202601', 'Alex Vance', '2012-05-15', 'Male', 'active')
        ON CONFLICT (id) DO NOTHING;
        
        -- C. Seed Parent-Student link in public.student_parents
        INSERT INTO public.student_parents (student_id, parent_user_id, relation)
        VALUES (u_student_rec_id, u_parent, 'guardian')
        ON CONFLICT (student_id, parent_user_id) DO NOTHING;
    END IF;

END $$;
