-- ==================================================
-- 092_admission_atomic_erp_provision.sql
-- Atomic ERP student provisioning in a single transaction
-- ==================================================

CREATE OR REPLACE FUNCTION public.fn_provision_admission_student(
    p_application_id UUID,
    p_admission_number TEXT,
    p_performed_by UUID DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_app RECORD;
    v_profile RECORD;
    v_parents RECORD;
    v_enquiry RECORD;
    v_student_id UUID;
    v_grade TEXT;
    v_student_name TEXT;
    v_first_name TEXT;
    v_last_name TEXT;
    v_parent_email TEXT;
    v_steps JSONB := '[]'::JSONB;
    v_barcode TEXT;
BEGIN
    SELECT * INTO v_app
    FROM public.admission_applications
    WHERE id = p_application_id AND deleted_at IS NULL
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Application % not found', p_application_id;
    END IF;

    IF EXISTS (
        SELECT 1 FROM public.students
        WHERE admission_no = p_admission_number AND deleted_at IS NULL
    ) THEN
        RAISE EXCEPTION 'Duplicate student: admission number % already exists', p_admission_number;
    END IF;

    IF EXISTS (
        SELECT 1 FROM public.admission_confirmation
        WHERE application_id = p_application_id AND student_id IS NOT NULL
    ) THEN
        RAISE EXCEPTION 'Application % already provisioned', p_application_id;
    END IF;

    SELECT * INTO v_profile
    FROM public.application_profiles
    WHERE application_id = p_application_id;

    SELECT ae.student_name, ae.parent_email, ae.parent_phone, ae.grade_applied_for
    INTO v_enquiry
    FROM public.admission_leads al
    JOIN public.admission_enquiries ae ON ae.id = al.enquiry_id
    WHERE al.id = v_app.lead_id
    LIMIT 1;

    v_student_name := COALESCE(v_enquiry.student_name, 'Student');
    v_grade := COALESCE(v_enquiry.grade_applied_for, 'Grade 1');
    v_first_name := split_part(v_student_name, ' ', 1);
    v_last_name := COALESCE(NULLIF(trim(substring(v_student_name from length(v_first_name) + 1)), ''), 'Student');

    v_student_id := gen_random_uuid();

    INSERT INTO public.students (
        id, admission_no, first_name, last_name, status, school_id, academic_year_id
    ) VALUES (
        v_student_id,
        p_admission_number,
        v_first_name,
        v_last_name,
        'ACTIVE',
        v_app.school_id,
        v_app.academic_year_id
    );
    v_steps := v_steps || jsonb_build_array(jsonb_build_object('stepName', 'Student', 'status', 'COMPLETED'));

    INSERT INTO public.student_profiles (
        id, student_id, date_of_birth, gender, blood_group, nationality, religion,
        category, aadhaar, photo_url, allergies, medical_conditions, emergency_notes
    ) VALUES (
        gen_random_uuid(),
        v_student_id,
        COALESCE(v_profile.date_of_birth, CURRENT_DATE),
        COALESCE(v_profile.gender, 'Other'),
        v_profile.blood_group,
        v_profile.nationality,
        v_profile.religion,
        v_profile.category,
        v_profile.aadhaar,
        v_profile.photo_url,
        v_profile.allergies,
        v_profile.medical_conditions,
        v_profile.emergency_notes
    );
    v_steps := v_steps || jsonb_build_array(jsonb_build_object('stepName', 'Medical', 'status', 'COMPLETED'));

    INSERT INTO public.student_academic_records (
        id, student_id, academic_year_id, grade, remarks
    ) VALUES (
        gen_random_uuid(),
        v_student_id,
        v_app.academic_year_id,
        v_grade,
        'Provisioned from admission application'
    );
    v_steps := v_steps || jsonb_build_array(jsonb_build_object('stepName', 'Academic', 'status', 'COMPLETED'));

    SELECT * INTO v_parents FROM public.application_parents WHERE application_id = p_application_id LIMIT 1;

    IF v_parents IS NOT NULL THEN
        IF v_parents.father_name IS NOT NULL THEN
            INSERT INTO public.student_parents (id, student_id, parent_name, relation, mobile_number, email)
            VALUES (gen_random_uuid(), v_student_id, v_parents.father_name, 'Father', v_parents.father_phone, v_parents.father_email);
        END IF;
        IF v_parents.mother_name IS NOT NULL THEN
            INSERT INTO public.student_parents (id, student_id, parent_name, relation, mobile_number, email)
            VALUES (gen_random_uuid(), v_student_id, v_parents.mother_name, 'Mother', v_parents.mother_phone, v_parents.mother_email);
        END IF;
        IF v_parents.guardian_name IS NOT NULL THEN
            INSERT INTO public.student_guardians (id, student_id, guardian_name, relation, mobile_number, email)
            VALUES (gen_random_uuid(), v_student_id, v_parents.guardian_name, COALESCE(v_parents.guardian_relation, 'Guardian'), COALESCE(v_parents.guardian_phone, ''), v_parents.guardian_email);
        END IF;
        v_parent_email := COALESCE(v_parents.father_email, v_parents.mother_email, v_parents.guardian_email, v_enquiry.parent_email);
    ELSE
        v_parent_email := v_enquiry.parent_email;
    END IF;
    v_steps := v_steps || jsonb_build_array(jsonb_build_object('stepName', 'Guardian', 'status', 'COMPLETED'));

    v_barcode := 'BAR-' || p_admission_number;
    INSERT INTO public.student_identity_cards (id, student_id, barcode, printed)
    VALUES (gen_random_uuid(), v_student_id, v_barcode, false);
    v_steps := v_steps || jsonb_build_array(jsonb_build_object('stepName', 'IDCard', 'status', 'COMPLETED'));

    INSERT INTO public.student_status_history (id, student_id, old_status, new_status, reason, changed_by)
    VALUES (gen_random_uuid(), v_student_id, 'NEW', 'ACTIVE', 'Admission ERP provisioning', p_performed_by);

    IF v_parent_email IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.users WHERE email = v_parent_email) THEN
        INSERT INTO public.users (id, username, email, role, status)
        VALUES (gen_random_uuid(), lower(p_admission_number) || '_parent', v_parent_email, 'parent', 'Active');
        v_steps := v_steps || jsonb_build_array(jsonb_build_object('stepName', 'ParentAccount', 'status', 'COMPLETED', 'message', v_parent_email));
    ELSE
        v_steps := v_steps || jsonb_build_array(jsonb_build_object('stepName', 'ParentAccount', 'status', 'SKIPPED', 'message', 'Parent account exists or no email'));
    END IF;

    INSERT INTO public.users (id, username, email, role, status)
    SELECT gen_random_uuid(), lower(p_admission_number), lower(p_admission_number) || '@student.edu.in', 'student', 'Active'
    WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE username = lower(p_admission_number));
    v_steps := v_steps || jsonb_build_array(jsonb_build_object('stepName', 'StudentAccount', 'status', 'COMPLETED'));

    UPDATE public.admission_confirmation
    SET student_id = v_student_id
    WHERE application_id = p_application_id;

    INSERT INTO public.admission_enrollment_logs (application_id, action, details, performed_by)
    VALUES (p_application_id, 'ERP_STUDENT_PROVISIONED', 'Atomic provisioning completed', p_performed_by);

    INSERT INTO public.student_provisioning_jobs (application_id, step_name, status, updated_at)
    VALUES
        (p_application_id, 'Student', 'COMPLETED', NOW()),
        (p_application_id, 'Academic', 'COMPLETED', NOW()),
        (p_application_id, 'Parent', 'COMPLETED', NOW()),
        (p_application_id, 'User', 'COMPLETED', NOW()),
        (p_application_id, 'Transport', 'SKIPPED', NOW()),
        (p_application_id, 'Hostel', 'SKIPPED', NOW()),
        (p_application_id, 'Library', 'COMPLETED', NOW()),
        (p_application_id, 'IDCard', 'COMPLETED', NOW())
    ON CONFLICT (application_id, step_name)
    DO UPDATE SET status = EXCLUDED.status, updated_at = NOW(), error_message = NULL;

    RETURN jsonb_build_object(
        'success', true,
        'applicationId', p_application_id,
        'admissionNumber', p_admission_number,
        'studentId', v_student_id,
        'steps', v_steps
    );
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'ERP provisioning failed: %', SQLERRM;
END;
$$;
