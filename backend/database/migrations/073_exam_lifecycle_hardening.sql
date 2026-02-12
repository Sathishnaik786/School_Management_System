-- ========================================================
-- MIGRATION: 073_exam_lifecycle_hardening
-- DESCRIPTION: Atomic Hall Ticket Generation, Result Publishing, and Immutability.
-- ========================================================

BEGIN;

-- 1. EXTEND EXAMS WITH LIFECYCLE FLAGS
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exams' AND column_name='hall_ticket_status') THEN
        ALTER TABLE public.exams 
        ADD COLUMN hall_ticket_status TEXT DEFAULT 'DRAFT' 
        CHECK (hall_ticket_status IN ('DRAFT','GENERATED','PUBLISHED'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exams' AND column_name='result_status') THEN
        ALTER TABLE public.exams 
        ADD COLUMN result_status TEXT DEFAULT 'DRAFT' 
        CHECK (result_status IN ('DRAFT','ENTERED','PUBLISHED','LOCKED'));
    END IF;
END $$;

-- 2. ATOMIC HALL TICKET GENERATION RPC
CREATE OR REPLACE FUNCTION public.fn_generate_hall_tickets(
    p_exam_id UUID,
    p_school_id UUID,
    p_user_id UUID
) RETURNS VOID AS $$
DECLARE
    v_seated_count INTEGER;
BEGIN
    -- 1. Validation: Seating must be published
    IF NOT EXISTS (SELECT 1 FROM public.exams WHERE id = p_exam_id AND seating_status = 'PUBLISHED') THEN
        RAISE EXCEPTION 'SEATING_NOT_PUBLISHED: Please publish seating allocation first.';
    END IF;

    -- 2. Validation: Status must be DRAFT or already GENERATED (allow re-run if not published)
    IF EXISTS (SELECT 1 FROM public.exams WHERE id = p_exam_id AND hall_ticket_status = 'PUBLISHED') THEN
        RAISE EXCEPTION 'HALL_TICKETS_LOCKED: Cannot regenerate after publication.';
    END IF;

    -- 3. Clear existing tickets for this exam (Self-healing)
    DELETE FROM public.exam_hall_tickets WHERE exam_id = p_exam_id;

    -- 4. Insert Tickets for all seated students
    INSERT INTO public.exam_hall_tickets (
        student_id, 
        exam_id, 
        hall_allocation_id, 
        ticket_code, 
        snapshot_data,
        status,
        generated_at
    )
    SELECT 
        esa.student_id,
        p_exam_id,
        esa.id,
        'HT-' || p_exam_id::TEXT || '-' || s.student_code,
        jsonb_build_object(
            'student_name', s.full_name,
            'student_code', s.student_code,
            'hall_name', h.hall_name,
            'seat_number', esa.seat_number,
            'generated_at', NOW()
        ),
        'GENERATED',
        NOW()
    FROM public.exam_seating_allocations esa
    JOIN public.students s ON esa.student_id = s.id
    JOIN public.exam_halls h ON esa.hall_id = h.id
    WHERE esa.exam_id = p_exam_id;

    GET DIAGNOSTICS v_seated_count = ROW_COUNT;

    IF v_seated_count = 0 THEN
        RAISE EXCEPTION 'NO_SEATING_FOUND: No students found in seating allocation for this exam.';
    END IF;

    -- 5. Update Status
    UPDATE public.exams 
    SET hall_ticket_status = 'GENERATED',
        updated_at = NOW()
    WHERE id = p_exam_id;

    -- 6. Log
    INSERT INTO public.academic_automation_logs (school_id, action, details, performed_by)
    VALUES (p_school_id, 'HALL_TICKETS_GENERATED', jsonb_build_object('exam_id', p_exam_id, 'count', v_seated_count), p_user_id);

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. HALL TICKET PUBLISH RPC
CREATE OR REPLACE FUNCTION public.fn_publish_hall_tickets(
    p_exam_id UUID,
    p_user_id UUID
) RETURNS VOID AS $$
DECLARE
    v_school_id UUID;
BEGIN
    -- 1. Get School ID
    SELECT school_id INTO v_school_id FROM public.exams WHERE id = p_exam_id;

    -- 2. Validation
    IF NOT EXISTS (SELECT 1 FROM public.exams WHERE id = p_exam_id AND hall_ticket_status = 'GENERATED') THEN
        RAISE EXCEPTION 'TICKETS_NOT_READY: Generate hall tickets before publishing.';
    END IF;

    -- 3. Update Status
    UPDATE public.exams 
    SET hall_ticket_status = 'PUBLISHED',
        updated_at = NOW()
    WHERE id = p_exam_id;

    -- 4. Log
    INSERT INTO public.academic_automation_logs (school_id, action, details, performed_by)
    VALUES (v_school_id, 'HALL_TICKETS_PUBLISHED', jsonb_build_object('exam_id', p_exam_id), p_user_id);

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. RESULT PUBLISH RPC
CREATE OR REPLACE FUNCTION public.fn_publish_exam_results(
    p_exam_id UUID,
    p_user_id UUID
) RETURNS VOID AS $$
DECLARE
    v_school_id UUID;
BEGIN
    -- 1. Get School ID
    SELECT school_id INTO v_school_id FROM public.exams WHERE id = p_exam_id;

    -- 2. Update Status and Finish Exam
    UPDATE public.exams 
    SET result_status = 'PUBLISHED',
        status = 'COMPLETED',
        updated_at = NOW()
    WHERE id = p_exam_id;

    -- 3. Log
    INSERT INTO public.academic_automation_logs (school_id, action, details, performed_by)
    VALUES (v_school_id, 'RESULTS_PUBLISHED', jsonb_build_object('exam_id', p_exam_id), p_user_id);

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. FINAL IMMUTABILITY TRIGGER
CREATE OR REPLACE FUNCTION public.fn_block_mutation_after_completion()
RETURNS TRIGGER AS $$
DECLARE
    v_exam_id UUID;
    v_status TEXT;
BEGIN
    -- Determine Exam ID based on TG_TABLE_NAME
    IF TG_TABLE_NAME = 'exam_seating_allocations' OR TG_TABLE_NAME = 'exam_eligibility_snapshots' OR TG_TABLE_NAME = 'marks' THEN
        v_exam_id = OLD.exam_id;
    END IF;

    -- Check status
    SELECT status INTO v_status FROM public.exams WHERE id = v_exam_id;

    IF v_status = 'COMPLETED' THEN
        RAISE EXCEPTION 'EXAM_COMPLETED: Cannot modify data for a completed exam.';
    END IF;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Apply Triggers
DROP TRIGGER IF EXISTS trg_block_seating_mutation ON public.exam_seating_allocations;
CREATE TRIGGER trg_block_seating_mutation
BEFORE UPDATE OR DELETE ON public.exam_seating_allocations
FOR EACH ROW EXECUTE FUNCTION public.fn_block_mutation_after_completion();

DROP TRIGGER IF EXISTS trg_block_eligibility_mutation ON public.exam_eligibility_snapshots;
CREATE TRIGGER trg_block_eligibility_mutation
BEFORE UPDATE OR DELETE ON public.exam_eligibility_snapshots
FOR EACH ROW EXECUTE FUNCTION public.fn_block_mutation_after_completion();

DROP TRIGGER IF EXISTS trg_block_results_mutation ON public.marks;
CREATE TRIGGER trg_block_results_mutation
BEFORE UPDATE OR DELETE ON public.marks
FOR EACH ROW EXECUTE FUNCTION public.fn_block_mutation_after_completion();

COMMIT;
