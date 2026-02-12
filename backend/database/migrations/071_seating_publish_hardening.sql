-- =======================================================
-- MIGRATION: 071_seating_publish_hardening
-- DESCRIPTION: Implements Seating Publication Hardening and Hall Modification Guards.
-- =======================================================

BEGIN;

-- 1. Prevent Hall Modification After Publish
CREATE OR REPLACE FUNCTION public.fn_block_hall_modification_if_published()
RETURNS trigger AS $$
DECLARE
    v_status TEXT;
BEGIN
    -- Check if any exam using this hall is in PUBLISHED seating state
    IF EXISTS (
        SELECT 1 
        FROM public.exam_seating_allocations sa
        JOIN public.exams e ON sa.exam_id = e.id
        WHERE sa.hall_id = OLD.id AND e.seating_status = 'PUBLISHED'
    ) THEN
        RAISE EXCEPTION 'HALL_MODIFICATION_LOCKED: This hall is used in a published seating allocation.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_block_hall_update ON public.exam_halls;
CREATE TRIGGER trg_block_hall_update
BEFORE UPDATE OR DELETE ON public.exam_halls
FOR EACH ROW
EXECUTE FUNCTION public.fn_block_hall_modification_if_published();

-- 2. Prevent Hall Capacity Change After Seating Exists
CREATE OR REPLACE FUNCTION public.fn_block_capacity_change_if_allocated()
RETURNS trigger AS $$
DECLARE
    v_count INTEGER;
BEGIN
    -- Check if any allocations exist for this hall
    SELECT count(*) INTO v_count
    FROM public.exam_seating_allocations
    WHERE hall_id = OLD.id;

    IF v_count > 0 THEN
        RAISE EXCEPTION 'CAPACITY_LOCKED: Cannot modify hall capacity with active allocations.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_block_capacity_update ON public.exam_halls;
CREATE TRIGGER trg_block_capacity_update
BEFORE UPDATE OF capacity ON public.exam_halls
FOR EACH ROW
EXECUTE FUNCTION public.fn_block_capacity_change_if_allocated();

-- 3. Atomic Publish RPC
CREATE OR REPLACE FUNCTION public.fn_publish_exam_seating(
    p_exam_id UUID,
    p_user_id UUID
) RETURNS VOID AS $$
DECLARE
    v_status TEXT;
    v_alloc_count INTEGER;
    v_school_id UUID;
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

    -- Update Status
    UPDATE public.exams
    SET seating_status = 'PUBLISHED'
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
        jsonb_build_object('examId', p_exam_id),
        p_user_id
    );

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
