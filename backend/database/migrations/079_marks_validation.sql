-- ============================================================
-- PHASE 17 — RESULT MODULE HARDENING (CRITICAL PRODUCTION PATCH)
-- 1. SCORE CEILING VALIDATION
-- 2. IMMUTABILITY HARD LOCK
-- 3. DENSE RANK ENGINE
-- ============================================================

BEGIN;

-- 1. SCORE CEILING VALIDATION
-- Enforces: 0 <= marks_obtained <= exam_subjects.max_marks
CREATE OR REPLACE FUNCTION public.fn_validate_marks_range()
RETURNS TRIGGER AS $$
DECLARE
    v_max_marks NUMERIC;
BEGIN
    -- We need to find max_marks from the exam_schedules (which links to the exam_subjects definition logic)
    -- Actually, in our schema, 'exams' has applicable_classes, but marks are per subject.
    -- The max_marks is usually defined in exam_schedules for that specific exam/subject combo.
    SELECT max_marks INTO v_max_marks
    FROM public.exam_schedules
    WHERE exam_id = NEW.exam_id AND subject_id = NEW.subject_id;

    -- Fallback if not found in schedule (shouldn't happen for valid seated students)
    IF v_max_marks IS NULL THEN
        v_max_marks := 100; -- Default fallback
    END IF;

    IF NEW.marks_obtained < 0 THEN
        RAISE EXCEPTION 'MARKS_CANNOT_BE_NEGATIVE';
    END IF;

    IF NEW.marks_obtained > v_max_marks THEN
        RAISE EXCEPTION 'MARKS_EXCEED_MAX_ALLOWED: Provided %, allowed %', NEW.marks_obtained, v_max_marks;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_marks_range ON public.marks;
CREATE TRIGGER trg_validate_marks_range
BEFORE INSERT OR UPDATE ON public.marks
FOR EACH ROW
EXECUTE FUNCTION public.fn_validate_marks_range();

-- 2. IMMUTABILITY HARD LOCK
-- Prevent updates/deletes after result_status = 'PUBLISHED'
CREATE OR REPLACE FUNCTION public.fn_block_marks_after_publish()
RETURNS TRIGGER AS $$
DECLARE
    v_status TEXT;
BEGIN
    -- Check old record on UPDATE/DELETE to see if it was already published
    SELECT result_status INTO v_status
    FROM public.exams
    WHERE id = COALESCE(OLD.exam_id, NEW.exam_id);

    IF v_status = 'PUBLISHED' THEN
        RAISE EXCEPTION 'RESULT_ALREADY_PUBLISHED_IMMUTABLE: Cannot modify marks for a published exam.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_block_marks_after_publish ON public.marks;
CREATE TRIGGER trg_block_marks_after_publish
BEFORE UPDATE OR DELETE ON public.marks
FOR EACH ROW
EXECUTE FUNCTION public.fn_block_marks_after_publish();

-- 3. DENSE RANK ENGINE
-- Calculates ranks based on total_obtained and percentage
CREATE OR REPLACE FUNCTION public.fn_calculate_exam_ranks(p_exam_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.student_result_summaries s
    SET rank = r.calculated_rank
    FROM (
        SELECT id,
               DENSE_RANK() OVER (ORDER BY total_obtained DESC, percentage DESC) AS calculated_rank
        FROM public.student_result_summaries
        WHERE exam_id = p_exam_id
    ) r
    WHERE s.id = r.id;
END;
$$ LANGUAGE plpgsql;

-- 4. Log Migration
INSERT INTO public.academic_automation_logs (action, details)
VALUES ('MIGRATION_APPLIED', '{"version": "079", "name": "result_module_hardening"}');

COMMIT;
