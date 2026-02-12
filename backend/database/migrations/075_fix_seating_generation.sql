-- ========================================================
-- MIGRATION: 075_fix_seating_generation
-- DESCRIPTION: Fixes 500 Error by making exam_schedule_id nullable and refining RPC capacity check.
-- ========================================================

BEGIN;

-- 1. Make exam_schedule_id nullable to support exam-scoped seating
ALTER TABLE public.exam_seating_allocations 
ALTER COLUMN exam_schedule_id DROP NOT NULL;

-- 2. Update fn_generate_exam_seating with active-only filters
CREATE OR REPLACE FUNCTION public.fn_generate_exam_seating(
    p_exam_id UUID,
    p_school_id UUID,
    p_user_id UUID
) RETURNS VOID AS $$
DECLARE
    v_eligible_count INTEGER;
    v_total_capacity INTEGER;
    v_seating_status TEXT;
    v_eligibility_frozen BOOLEAN;
    v_student_record RECORD;
    v_seat_counter INTEGER := 1;
    v_hall_cursor REFCURSOR;
    v_current_hall_id UUID;
    v_current_hall_capacity INTEGER;
BEGIN
    -- A. Safety Checks
    SELECT seating_status, eligibility_frozen INTO v_seating_status, v_eligibility_frozen
    FROM public.exams WHERE id = p_exam_id;

    IF NOT FOUND THEN 
        RAISE EXCEPTION 'EXAM_NOT_FOUND'; 
    END IF;
    
    IF v_seating_status = 'PUBLISHED' THEN 
        RAISE EXCEPTION 'SEATING_LOCKED: Cannot generate seating for a published exam.'; 
    END IF;
    
    IF NOT v_eligibility_frozen THEN 
        RAISE EXCEPTION 'ELIGIBILITY_NOT_FROZEN: Please promote students to seating first.'; 
    END IF;

    -- B. Count Promoted Students
    SELECT count(*) INTO v_eligible_count 
    FROM public.exam_eligibility_snapshots 
    WHERE exam_id = p_exam_id AND promoted_to_seating = true AND eligible = true;

    IF v_eligible_count = 0 THEN 
        RAISE EXCEPTION 'NO_PROMOTED_STUDENTS'; 
    END IF;

    -- C. Capacity Check (Filtering by is_active = true)
    SELECT COALESCE(sum(capacity), 0) INTO v_total_capacity 
    FROM public.exam_halls 
    WHERE school_id = p_school_id AND is_active = true;

    IF v_eligible_count > v_total_capacity THEN 
        RAISE EXCEPTION 'INSUFFICIENT_CAPACITY: Need % seats, only % available (Active Halls).', v_eligible_count, v_total_capacity; 
    END IF;

    -- D. Clear existing (Atomic within transaction)
    DELETE FROM public.exam_seating_allocations WHERE exam_id = p_exam_id;

    -- E. Setup Hall Iteration (Filtering by is_active = true)
    OPEN v_hall_cursor FOR 
        SELECT id, capacity FROM public.exam_halls 
        WHERE school_id = p_school_id AND is_active = true
        ORDER BY hall_name;
    
    FETCH v_hall_cursor INTO v_current_hall_id, v_current_hall_capacity;

    -- F. Allocation Loop
    FOR v_student_record IN (
        SELECT s.student_id 
        FROM public.exam_eligibility_snapshots s
        JOIN public.students st ON s.student_id = st.id
        WHERE s.exam_id = p_exam_id 
          AND s.promoted_to_seating = true 
          AND s.eligible = true
        ORDER BY st.student_code ASC
    ) LOOP
        -- Switch Hall if Capacity Reached
        IF v_seat_counter > v_current_hall_capacity THEN
            FETCH v_hall_cursor INTO v_current_hall_id, v_current_hall_capacity;
            IF NOT FOUND THEN
                RAISE EXCEPTION 'LOGIC_ERROR: Ran out of halls despite capacity check.';
            END IF;
            v_seat_counter := 1;
        END IF;

        -- Allocate (exam_schedule_id will be NULL here)
        INSERT INTO public.exam_seating_allocations (exam_id, student_id, hall_id, seat_number)
        VALUES (p_exam_id, v_student_record.student_id, v_current_hall_id, 'S-' || v_seat_counter);

        v_seat_counter := v_seat_counter + 1;
    END LOOP;

    CLOSE v_hall_cursor;

    -- G. Audit Trail
    INSERT INTO public.academic_automation_logs (school_id, action, details, performed_by)
    VALUES (p_school_id, 'SEATING_GENERATE', 
           jsonb_build_object(
               'examId', p_exam_id, 
               'studentCount', v_eligible_count,
               'source', 'RPC_ATOMIC_FIXED'
           ), 
           p_user_id);

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
