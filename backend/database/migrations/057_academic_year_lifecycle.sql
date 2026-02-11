-- ==========================================
-- 057_academic_year_lifecycle.sql
-- Introduce Status-based lifecycle control
-- ==========================================

-- 1. Add status column with check constraint
ALTER TABLE public.academic_years 
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('DRAFT', 'ACTIVE', 'CLOSED')) DEFAULT 'DRAFT';

-- 2. Backfill existing data
-- Assume currently active years are 'ACTIVE'
UPDATE public.academic_years 
SET status = 'ACTIVE' 
WHERE is_active = true;

-- Assume all others are 'DRAFT' (default) or 'CLOSED' if they have significant historical markers.
-- For simplicity, we keep them as 'DRAFT' and allow Admin to 'CLOSE' them via the new governance UI.

-- 3. Add comment
COMMENT ON COLUMN public.academic_years.status IS 'Lifecycle state: DRAFT (Upcoming), ACTIVE (Current), CLOSED (Archived/Read-only)';
