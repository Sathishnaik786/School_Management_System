-- ==========================================
-- MIGRATION: 048_enhance_attendance_period_wise
-- DESCRIPTION: Upgrades attendance to support period-wise tracking and adds subject links.
-- DATE: 2026-02-05
-- ==========================================

-- 1. Modify ATTENDANCE_SESSIONS
ALTER TABLE public.attendance_sessions
ADD COLUMN IF NOT EXISTS subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS start_time TIME,
ADD COLUMN IF NOT EXISTS end_time TIME; -- Optional, for duration

-- 2. Update Constraints
-- Drop the daily constraint (Unique Section + Date)
ALTER TABLE public.attendance_sessions 
DROP CONSTRAINT IF EXISTS attendance_sessions_section_id_date_key;

-- Add new constraint: (Section + Date + StartTime).
-- Note: Postgres UNIQUE allows multiple NULLs. So multiple "Daily" records (NULL start_time) are technically allowed if we don't partial index.
-- However, for logical correctness, we want:
-- 1. Daily record (start_time IS NULL) -> Unique (Section + Date)
-- 2. Period record (start_time IS NOT NULL) -> Unique (Section + Date + StartTime)

CREATE UNIQUE INDEX IF NOT EXISTS attendance_sessions_daily_idx 
ON public.attendance_sessions (section_id, date) 
WHERE start_time IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS attendance_sessions_period_idx 
ON public.attendance_sessions (section_id, date, start_time) 
WHERE start_time IS NOT NULL;

-- 3. Cleanup/Consolidate Assignments (Comment only, logic handling in API)
-- We retain 'faculty_sections' for Class Teachers (Homeroom)
-- We use 'faculty_section_subjects' or 'timetable_slots' for Period assignments.

