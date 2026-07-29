-- ========================================================
-- MIGRATION: 076_fix_missing_seating_schema
-- DESCRIPTION: Repairs missing schema from skipped migration 068.
-- ========================================================

BEGIN;

-- 1. Add missing seating status and standard timestamps to exams
ALTER TABLE public.exams 
ADD COLUMN IF NOT EXISTS seating_status TEXT CHECK (seating_status IN ('DRAFT', 'PUBLISHED')) DEFAULT 'DRAFT',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Add grid support to exam_halls
ALTER TABLE public.exam_halls 
ADD COLUMN IF NOT EXISTS rows_count INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS cols_count INTEGER DEFAULT 5;

-- 3. Create missing Hall Tickets table
CREATE TABLE IF NOT EXISTS public.exam_hall_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
    hall_allocation_id UUID REFERENCES public.exam_seating_allocations(id) ON DELETE CASCADE,
    
    ticket_code TEXT UNIQUE NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT CHECK (status IN ('GENERATED', 'DOWNLOADED', 'REVOKED')) DEFAULT 'GENERATED',
    
    -- Store snapshots of data at time of generation for security/integrity
    snapshot_data JSONB, 
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE (student_id, exam_id)
);

-- Indexing
CREATE INDEX IF NOT EXISTS idx_hall_tickets_exam ON public.exam_hall_tickets(exam_id);
CREATE INDEX IF NOT EXISTS idx_hall_tickets_student ON public.exam_hall_tickets(student_id);

-- 4. Ensure exam_id exists on seating allocations (Self-healing redundancy)
ALTER TABLE public.exam_seating_allocations 
ADD COLUMN IF NOT EXISTS exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 5. Fix 500 Error: Make exam_schedule_id nullable
ALTER TABLE public.exam_seating_allocations 
ALTER COLUMN exam_schedule_id DROP NOT NULL;

-- 6. Harden Uniqueness (Ensure we only have one seat per student per exam)
ALTER TABLE public.exam_seating_allocations
DROP CONSTRAINT IF EXISTS unique_student_exam_seat;

ALTER TABLE public.exam_seating_allocations
ADD CONSTRAINT unique_student_exam_seat UNIQUE (exam_id, student_id);

-- 7. REFINED RPC: fn_generate_exam_seating (Consolidated Fix)
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
               'source', 'RPC_ATOMIC_FIXED_COMPLETE'
           ), 
           p_user_id);

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
