-- =======================================================
-- MIGRATION: 069_exam_seating_lock
-- DESCRIPTION: Adds seating promotion flags and hardens the eligibility freeze process.
-- =======================================================

BEGIN;

-- 1. Add promotion flags to eligibility snapshots
ALTER TABLE public.exam_eligibility_snapshots
ADD COLUMN IF NOT EXISTS promoted_to_seating BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS promoted_at TIMESTAMP WITH TIME ZONE;

-- 2. Ensure exams has eligibility_frozen (already exists from 062, but adding safety)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exams' AND column_name='eligibility_frozen') THEN
        ALTER TABLE public.exams ADD COLUMN eligibility_frozen BOOLEAN DEFAULT false;
    END IF;
END $$;

-- 3. Update fn_freeze_exam_eligibility to handle seating promotion
CREATE OR REPLACE FUNCTION public.fn_freeze_exam_eligibility(
    p_exam_id UUID,
    p_performed_by UUID,
    p_eligibility_data JSONB 
) RETURNS VOID AS $$
BEGIN
    -- 1. Safety Check: Already frozen?
    IF EXISTS (SELECT 1 FROM public.exams WHERE id = p_exam_id AND eligibility_frozen = true) THEN
        RAISE EXCEPTION 'ELIGIBILITY_ALREADY_FROZEN: This exam already has a frozen/promoted eligibility set.';
    END IF;

    -- 2. Clear old snapshots if any (repeat-safe)
    DELETE FROM public.exam_eligibility_snapshots WHERE exam_id = p_exam_id;

    -- 3. Insert Snapshots with Promotion Flag for Eligible Students
    INSERT INTO public.exam_eligibility_snapshots (
        exam_id, 
        student_id, 
        eligible, 
        attendance_percentage, 
        fees_status, 
        reasons, 
        captured_at, 
        original_eligible,
        promoted_to_seating,
        promoted_at
    )
    SELECT 
        p_exam_id,
        (val->>'student_id')::UUID,
        (val->>'eligible')::BOOLEAN,
        (val->>'attendance_percentage')::NUMERIC,
        (val->>'fees_status')::TEXT,
        (val->'reasons')::JSONB,
        NOW(),
        (val->>'eligible')::BOOLEAN,
        (val->>'eligible')::BOOLEAN, -- If eligible, promote to seating instantly during freeze
        CASE WHEN (val->>'eligible')::BOOLEAN THEN NOW() ELSE NULL END
    FROM jsonb_array_elements(p_eligibility_data) AS val;

    -- 4. Mark Exam as Frozen
    UPDATE public.exams 
    SET eligibility_frozen = true, 
        eligibility_frozen_at = NOW()
    WHERE id = p_exam_id;

    -- 5. Log
    INSERT INTO public.academic_automation_logs (school_id, action, details, performed_by)
    SELECT school_id, 'ELIGIBILITY_PROMOTED_TO_SEATING', 
           jsonb_build_object('exam_id', p_exam_id, 'student_count', jsonb_array_length(p_eligibility_data)), 
           p_performed_by
    FROM public.exams WHERE id = p_exam_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
