-- =======================================================
-- MIGRATION: 060_attendance_foundation_hardening
-- DESCRIPTION: Hardens attendance integrity and scales academic years.
-- =======================================================

-- 1. Scale Academic Year with Boundaries
ALTER TABLE public.academic_years 
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE;

-- Update existing active year if possible (Assume standard calendar for now)
UPDATE public.academic_years 
SET start_date = '2026-01-01', end_date = '2026-12-31'
WHERE year_label LIKE '%2026%' AND start_date IS NULL;

-- 2. Harden Attendance Sessions
-- Ensure sessions cannot be created outside academic boundaries
CREATE OR REPLACE FUNCTION public.fn_validate_attendance_date()
RETURNS TRIGGER AS $$
DECLARE
    y_start DATE;
    y_end DATE;
BEGIN
    SELECT start_date, end_date INTO y_start, y_end
    FROM public.academic_years
    WHERE id = NEW.academic_year_id;

    IF NEW.date < y_start OR NEW.date > y_end THEN
        RAISE EXCEPTION 'DATE_OUT_OF_RANGE: Attendance date % is outside academic year boundaries (% to %)', NEW.date, y_start, y_end;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_attendance_date ON public.attendance_sessions;
CREATE TRIGGER trg_validate_attendance_date
    BEFORE INSERT OR UPDATE ON public.attendance_sessions
    FOR EACH ROW EXECUTE FUNCTION public.fn_validate_attendance_date();

-- 3. Consolidate Unique Constraint
-- Currently (section_id, date) is unique. This reinforces DAILY attendance.
-- We'll keep this strictly for DAILY but ensure subject_id and start_time columns exist in sessions.
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attendance_sessions' AND column_name='subject_id') THEN
        ALTER TABLE public.attendance_sessions ADD COLUMN subject_id UUID REFERENCES public.subjects(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attendance_sessions' AND column_name='start_time') THEN
        ALTER TABLE public.attendance_sessions ADD COLUMN start_time TIME;
    END IF;
END $$;

-- 4. Audit Trail for Attendance Edits
-- Store who changed what in attendance_records
ALTER TABLE public.attendance_records 
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE;

-- Create Trigger for update logging
CREATE OR REPLACE FUNCTION public.fn_log_attendance_update()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    -- updated_by should be set by application
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_log_attendance_update ON public.attendance_records;
CREATE TRIGGER trg_log_attendance_update
    BEFORE UPDATE ON public.attendance_records
    FOR EACH ROW EXECUTE FUNCTION public.fn_log_attendance_update();

-- 5. Performance Scaling
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_year ON public.attendance_sessions(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_status ON public.attendance_records(status);
