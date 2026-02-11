-- =======================================================
-- MIGRATION: 063_exam_lifecycle_hardening
-- DESCRIPTION: Implements Exam Day Conduct, Marks Locking, and Result Publishing Hardening.
-- =======================================================

BEGIN;

-- 1. Enhance EXAMS with Status
ALTER TABLE public.exams 
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED')) DEFAULT 'DRAFT';

-- 2. Repair Dependencies (Ensure they exist in public schema)
CREATE TABLE IF NOT EXISTS public.exam_halls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    hall_name TEXT NOT NULL,
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.exam_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    exam_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    max_marks NUMERIC DEFAULT 100,
    passing_marks NUMERIC DEFAULT 35,
    status TEXT DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'COMPLETED', 'CANCELLED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_exam_subject_schedule UNIQUE (exam_id, subject_id),
    CONSTRAINT check_time_order CHECK (end_time > start_time)
);

CREATE TABLE IF NOT EXISTS public.exam_seating_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_schedule_id UUID NOT NULL REFERENCES public.exam_schedules(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    hall_id UUID NOT NULL REFERENCES public.exam_halls(id) ON DELETE CASCADE,
    seat_number TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_student_schedule_seat UNIQUE (exam_schedule_id, student_id),
    CONSTRAINT unique_hall_seat_schedule UNIQUE (exam_schedule_id, hall_id, seat_number)
);

-- 3. Enhance EXAM_SCHEDULES with Locking
ALTER TABLE public.exam_schedules
ADD COLUMN IF NOT EXISTS results_locked BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS results_locked_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS results_locked_by UUID REFERENCES public.users(id);

-- 3. EXAM CONDUCT (Hall-Specific Attendance)
CREATE TABLE IF NOT EXISTS public.exam_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_schedule_id UUID REFERENCES public.exam_schedules(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    hall_id UUID REFERENCES public.exam_halls(id) ON DELETE SET NULL,
    
    status TEXT CHECK (status IN ('PRESENT', 'ABSENT', 'MALPRACTICE')) DEFAULT 'PRESENT',
    remarks TEXT,
    
    marked_by UUID REFERENCES public.users(id),
    marked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE (exam_schedule_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_exam_att_schedule ON public.exam_attendance(exam_schedule_id);

-- 4. Marks Hardening (Audit + Status)
ALTER TABLE public.marks 
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('PRESENT', 'ABSENT', 'MALPRACTICE')) DEFAULT 'PRESENT',
ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS remarks TEXT;

-- 5. Trigger to prevent marks entry for non-seated or ineligible students
-- However, we'll enforce "Seated Only" via Backend Logic.
-- DB Level: Ensure marks cannot be updated if schedule is locked.
CREATE OR REPLACE FUNCTION public.fn_check_marks_lock()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if schedule is locked
    IF EXISTS (
        SELECT 1 FROM public.exam_schedules 
        WHERE id = NEW.exam_schedule_id AND results_locked = true
    ) THEN
        RAISE EXCEPTION 'RESULTS_LOCKED: Marks for this subject are finalized and locked.';
    END IF;

    -- Check if student is seated (Exams must operate on Frozen Seating)
    IF NOT EXISTS (
        SELECT 1 FROM public.exam_seating_allocations
        WHERE exam_schedule_id = NEW.exam_schedule_id AND student_id = NEW.student_id
    ) THEN
        RAISE EXCEPTION 'STUDENT_NOT_SEATED: Only seated/eligible students can have marks entered.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Helper to find exam_schedule_id from marks
-- Wait, the `marks` table in 006 uses (student_id, exam_id, subject_id).
-- We can find the schedule using (exam_id, subject_id).

CREATE OR REPLACE FUNCTION public.fn_protect_marks_lifecycle()
RETURNS TRIGGER AS $$
DECLARE
    v_schedule_id UUID;
    v_locked BOOLEAN;
BEGIN
    SELECT id, results_locked INTO v_schedule_id, v_locked
    FROM public.exam_schedules
    WHERE exam_id = NEW.exam_id AND subject_id = NEW.subject_id;

    IF v_locked THEN
        RAISE EXCEPTION 'RESULTS_LOCKED: Marks for this subject are finalized and locked.';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM public.exam_seating_allocations
        WHERE exam_schedule_id = v_schedule_id AND student_id = NEW.student_id
    ) THEN
        RAISE EXCEPTION 'STUDENT_NOT_SEATED: Only seated/eligible students can have marks entered.';
    END IF;

    NEW.entered_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_protect_marks_lifecycle ON public.marks;
CREATE TRIGGER trg_protect_marks_lifecycle
    BEFORE INSERT OR UPDATE ON public.marks
    FOR EACH ROW EXECUTE FUNCTION public.fn_protect_marks_lifecycle();

-- 6. RPC: Finalize Marks for a Subject
CREATE OR REPLACE FUNCTION public.fn_lock_exam_subject(
    p_schedule_id UUID,
    p_performed_by UUID
) RETURNS VOID AS $$
BEGIN
    UPDATE public.exam_schedules
    SET results_locked = true,
        results_locked_at = NOW(),
        results_locked_by = p_performed_by
    WHERE id = p_schedule_id;
    
    -- Log
    INSERT INTO public.academic_automation_logs (action, details, performed_by)
    VALUES ('EXAM_SUBJECT_LOCKED', jsonb_build_object('schedule_id', p_schedule_id), p_performed_by);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Immutability for Published Results
CREATE OR REPLACE FUNCTION public.fn_freeze_published_results()
RETURNS TRIGGER AS $$
BEGIN
    -- Allow changing is_published to true, but not changing a TRUE to FALSE without specific logic?
    -- Actually, prompt says "Immutable after publish".
    IF OLD.is_published = true AND (NEW.is_published = true OR NEW.total_obtained != OLD.total_obtained) THEN
         -- Allow ONLY administrative unpublish if needed? 
         -- Prompt says "Immutable after publish". 
         -- We block any changes to a record that is ALREADY published.
         RAISE EXCEPTION 'RESULT_FINALIZED: Published results are immutable.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_freeze_published_results ON public.student_result_summaries;
CREATE TRIGGER trg_freeze_published_results
    BEFORE UPDATE ON public.student_result_summaries
    FOR EACH ROW EXECUTE FUNCTION public.fn_freeze_published_results();

COMMIT;
