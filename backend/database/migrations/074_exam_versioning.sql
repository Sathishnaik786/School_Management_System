-- ========================================================
-- MIGRATION: 074_exam_versioning
-- DESCRIPTION: Immutable Revision Tracking for Seating and Results.
-- ========================================================

BEGIN;

-- 1. VERSION TABLES
CREATE TABLE IF NOT EXISTS public.exam_seating_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    snapshot JSONB NOT NULL,
    revision_reason TEXT,
    revised_by UUID,
    revised_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.exam_result_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    snapshot JSONB NOT NULL,
    revision_reason TEXT,
    revised_by UUID,
    revised_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure version number uniqueness per exam
ALTER TABLE public.exam_seating_versions ADD CONSTRAINT unique_exam_seating_version UNIQUE (exam_id, version_number);
ALTER TABLE public.exam_result_versions ADD CONSTRAINT unique_exam_result_version UNIQUE (exam_id, version_number);

-- 2. UPDATED SEATING PUBLISH RPC (With Version Capture)
CREATE OR REPLACE FUNCTION public.fn_publish_exam_seating(
    p_exam_id UUID,
    p_user_id UUID
) RETURNS VOID AS $$
DECLARE
    v_status TEXT;
    v_alloc_count INTEGER;
    v_school_id UUID;
    v_version INTEGER;
    v_snapshot JSONB;
BEGIN
    -- Validate Exam
    SELECT seating_status, school_id INTO v_status, v_school_id
    FROM public.exams
    WHERE id = p_exam_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'EXAM_NOT_FOUND';
    END IF;

    IF v_status = 'PUBLISHED' THEN
        RAISE EXCEPTION 'SEATING_ALREADY_PUBLISHED';
    END IF;

    -- Validate Allocation Existence
    SELECT count(*) INTO v_alloc_count
    FROM public.exam_seating_allocations
    WHERE exam_id = p_exam_id;

    IF v_alloc_count = 0 THEN
        RAISE EXCEPTION 'NO_SEATING_GENERATED';
    END IF;

    -- CAPTURE VERSION
    SELECT COALESCE(MAX(version_number), 0) + 1 INTO v_version
    FROM public.exam_seating_versions
    WHERE exam_id = p_exam_id;

    SELECT jsonb_agg(row_to_json(esa)) INTO v_snapshot
    FROM public.exam_seating_allocations esa
    WHERE exam_id = p_exam_id;

    INSERT INTO public.exam_seating_versions (exam_id, version_number, snapshot, revised_by)
    VALUES (p_exam_id, v_version, v_snapshot, p_user_id);

    -- Update Status
    UPDATE public.exams
    SET seating_status = 'PUBLISHED',
        updated_at = NOW()
    WHERE id = p_exam_id;

    -- Log Audit Trail
    INSERT INTO public.academic_automation_logs (
        school_id,
        action,
        details,
        performed_by
    ) VALUES (
        v_school_id,
        'SEATING_PUBLISHED',
        jsonb_build_object('examId', p_exam_id, 'version', v_version),
        p_user_id
    );

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. UPDATED RESULT PUBLISH RPC (With Rank Engine and Snapshot Context)
CREATE OR REPLACE FUNCTION public.fn_publish_exam_results(
    p_exam_id UUID,
    p_user_id UUID
) RETURNS VOID AS $$
DECLARE
    v_school_id UUID;
    v_version INTEGER;
    v_snapshot JSONB;
    v_metadata JSONB;
    v_marks_snapshot JSONB;
    v_summaries_snapshot JSONB;
BEGIN
    -- 1. Get School ID and Basic Info
    SELECT school_id INTO v_school_id FROM public.exams WHERE id = p_exam_id;

    -- 2. GATE: ENFORCE ALL SUBJECTS LOCKED
    IF EXISTS (
        SELECT 1 FROM public.exam_schedules 
        WHERE exam_id = p_exam_id AND results_locked = false
    ) THEN
        RAISE EXCEPTION 'UNLOCKED_SUBJECTS_REMAIN: All subject results must be locked before publication.';
    END IF;

    -- 3. CALCULATE RANKS
    PERFORM public.fn_calculate_exam_ranks(p_exam_id);

    -- 4. CAPTURE VERSION
    SELECT COALESCE(MAX(version_number), 0) + 1 INTO v_version
    FROM public.exam_result_versions
    WHERE exam_id = p_exam_id;

    -- Capture Marks with Subject Detail
    SELECT jsonb_agg(row_to_json(m_detail)) INTO v_marks_snapshot
    FROM (
        SELECT m.*, s.name as subject_name, s.code as subject_code
        FROM public.marks m
        JOIN public.subjects s ON m.subject_id = s.id
        WHERE m.exam_id = p_exam_id
    ) m_detail;

    -- Capture Summaries with Student Detail
    SELECT jsonb_agg(row_to_json(s_detail)) INTO v_summaries_snapshot
    FROM (
        SELECT rs.*, st.full_name, st.student_code
        FROM public.student_result_summaries rs
        JOIN public.students st ON rs.student_id = st.id
        WHERE rs.exam_id = p_exam_id
    ) s_detail;

    v_metadata := jsonb_build_object(
        'published_at', NOW(),
        'published_by', p_user_id,
        'version', v_version
    );

    v_snapshot := jsonb_build_object(
        'metadata', v_metadata,
        'marks', COALESCE(v_marks_snapshot, '[]'::jsonb),
        'summaries', COALESCE(v_summaries_snapshot, '[]'::jsonb)
    );

    INSERT INTO public.exam_result_versions (exam_id, version_number, snapshot, revised_by)
    VALUES (p_exam_id, v_version, v_snapshot, p_user_id);

    -- 5. Update Status and Finish Exam
    UPDATE public.exams 
    SET result_status = 'PUBLISHED',
        status = 'COMPLETED',
        updated_at = NOW()
    WHERE id = p_exam_id;

    -- Update Summary Table Lock (Trigger will handle immutability from hereafter)
    UPDATE public.student_result_summaries
    SET is_published = true,
        updated_at = NOW()
    WHERE exam_id = p_exam_id;

    -- 6. Log
    INSERT INTO public.academic_automation_logs (school_id, action, details, performed_by)
    VALUES (v_school_id, 'RESULTS_PUBLISHED', jsonb_build_object('exam_id', p_exam_id, 'version', v_version), p_user_id);

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. RESTORE SEATING VERSION RPC
CREATE OR REPLACE FUNCTION public.fn_restore_seating_version(
    p_exam_id UUID,
    p_version_number INTEGER,
    p_user_id UUID
) RETURNS VOID AS $$
DECLARE
    v_status TEXT;
    v_snapshot JSONB;
    v_school_id UUID;
BEGIN
    -- 1. Validation: Only if not COMPLETED
    SELECT status, school_id INTO v_status, v_school_id FROM public.exams WHERE id = p_exam_id;
    
    IF v_status = 'COMPLETED' THEN
        RAISE EXCEPTION 'EXAM_COMPLETED: Cannot restore seating for a finalized exam.';
    END IF;

    -- 2. Get Snapshot
    SELECT snapshot INTO v_snapshot 
    FROM public.exam_seating_versions 
    WHERE exam_id = p_exam_id AND version_number = p_version_number;

    IF v_snapshot IS NULL THEN
        RAISE EXCEPTION 'VERSION_NOT_FOUND: Seating version % not found.', p_version_number;
    END IF;

    -- 3. Clear current seating
    DELETE FROM public.exam_seating_allocations WHERE exam_id = p_exam_id;

    -- 4. Restore from JSONB
    INSERT INTO public.exam_seating_allocations (
        id, exam_id, exam_schedule_id, student_id, hall_id, seat_number, created_at
    )
    SELECT 
        (elem->>'id')::UUID,
        (elem->>'exam_id')::UUID,
        (elem->>'exam_schedule_id')::UUID,
        (elem->>'student_id')::UUID,
        (elem->>'hall_id')::UUID,
        (elem->>'seat_number')::TEXT,
        (elem->>'created_at')::TIMESTAMP WITH TIME ZONE
    FROM jsonb_array_elements(v_snapshot) elem;

    -- 5. Set Seating Status back to published (since it was a published version)
    UPDATE public.exams SET seating_status = 'PUBLISHED' WHERE id = p_exam_id;

    -- 6. Log
    INSERT INTO public.academic_automation_logs (school_id, action, details, performed_by)
    VALUES (v_school_id, 'SEATING_VERSION_RESTORED', jsonb_build_object('exam_id', p_exam_id, 'version', p_version_number), p_user_id);

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
