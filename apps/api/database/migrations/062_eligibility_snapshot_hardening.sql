-- =======================================================
-- MIGRATION: 062_eligibility_snapshot_hardening
-- DESCRIPTION: Introduces Eligibility Snapshots, Overrides, and Gating.
-- =======================================================

BEGIN;

-- 1. Extend Exams with Term and Snapshot State
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exams' AND column_name='term') THEN
        ALTER TABLE public.exams 
        ADD COLUMN term TEXT CHECK (term IN ('Q1', 'Q2', 'Q3', 'Q4', 'ANNUAL', 'OTHER')) DEFAULT 'ANNUAL';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exams' AND column_name='eligibility_frozen') THEN
        ALTER TABLE public.exams 
        ADD COLUMN eligibility_frozen BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exams' AND column_name='eligibility_frozen_at') THEN
        ALTER TABLE public.exams 
        ADD COLUMN eligibility_frozen_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- 2. Create Eligibility Snapshots Table
CREATE TABLE IF NOT EXISTS public.exam_eligibility_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    
    eligible BOOLEAN NOT NULL,
    attendance_percentage NUMERIC(5, 2),
    fees_status TEXT CHECK (fees_status IN ('CLEARED', 'PENDING')),
    reasons JSONB DEFAULT '[]'::jsonb,
    
    -- Snapshot Metadata
    captured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Override Support (Audited)
    is_overridden BOOLEAN DEFAULT false,
    override_reason TEXT,
    overridden_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    overridden_at TIMESTAMP WITH TIME ZONE,
    original_eligible BOOLEAN, -- Keep track of what system thought

    UNIQUE (exam_id, student_id)
);

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_elig_snap_exam ON public.exam_eligibility_snapshots(exam_id);
CREATE INDEX IF NOT EXISTS idx_elig_snap_student ON public.exam_eligibility_snapshots(student_id);

-- 3. Audit Logging (Reusing academic_automation_logs)
-- We'll log ELIGIBILITY_FREEZE and ELIGIBILITY_OVERRIDE actions there.

-- 4. RPC to Freeze Eligibility
-- This runs the logic for all students in the exam's applicable classes and persists it.
CREATE OR REPLACE FUNCTION public.fn_freeze_exam_eligibility(
    p_exam_id UUID,
    p_performed_by UUID,
    p_eligibility_data JSONB -- Pass data from backend logic for flexibility or compute here? 
                             -- Senior Architect: Backend computes, DB persists to ensure accuracy of business logic.
) RETURNS VOID AS $$
BEGIN
    -- 1. Safety Check: Already frozen?
    IF EXISTS (SELECT 1 FROM public.exams WHERE id = p_exam_id AND eligibility_frozen = true) THEN
        RAISE EXCEPTION 'ELIGIBILITY_ALREADY_FROZEN: This exam already has a frozen eligibility set.';
    END IF;

    -- 2. Clear old snapshots if any (repeat-safe)
    DELETE FROM public.exam_eligibility_snapshots WHERE exam_id = p_exam_id;

    -- 3. Insert Snapshots
    INSERT INTO public.exam_eligibility_snapshots (
        exam_id, student_id, eligible, attendance_percentage, fees_status, reasons, captured_at, original_eligible
    )
    SELECT 
        p_exam_id,
        (val->>'student_id')::UUID,
        (val->>'eligible')::BOOLEAN,
        (val->>'attendance_percentage')::NUMERIC,
        (val->>'fees_status')::TEXT,
        (val->'reasons')::JSONB,
        NOW(),
        (val->>'eligible')::BOOLEAN
    FROM jsonb_array_elements(p_eligibility_data) AS val;

    -- 4. Mark Exam as Frozen
    UPDATE public.exams 
    SET eligibility_frozen = true, 
        eligibility_frozen_at = NOW()
    WHERE id = p_exam_id;

    -- 5. Log
    INSERT INTO public.academic_automation_logs (school_id, action, details, performed_by)
    SELECT school_id, 'ELIGIBILITY_FREEZE', jsonb_build_object('exam_id', p_exam_id, 'student_count', jsonb_array_length(p_eligibility_data)), p_performed_by
    FROM public.exams WHERE id = p_exam_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. RPC for Override
CREATE OR REPLACE FUNCTION public.fn_override_eligibility(
    p_snapshot_id UUID,
    p_new_eligible BOOLEAN,
    p_reason TEXT,
    p_performed_by UUID
) RETURNS VOID AS $$
BEGIN
    UPDATE public.exam_eligibility_snapshots
    SET 
        eligible = p_new_eligible,
        is_overridden = true,
        override_reason = p_reason,
        overridden_by = p_performed_by,
        overridden_at = NOW()
    WHERE id = p_snapshot_id;

    -- Log
    INSERT INTO public.academic_automation_logs (school_id, action, details, performed_by)
    SELECT e.school_id, 'ELIGIBILITY_OVERRIDE', jsonb_build_object('snapshot_id', p_snapshot_id, 'new_status', p_new_eligible), p_performed_by
    FROM public.exam_eligibility_snapshots s
    JOIN public.exams e ON s.exam_id = e.id
    WHERE s.id = p_snapshot_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
