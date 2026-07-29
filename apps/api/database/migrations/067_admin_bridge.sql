BEGIN;

-- 1. Hardening: Update Source Constraints to allow 'ADMIN'
ALTER TABLE public.student_attendance_cache
    DROP CONSTRAINT IF EXISTS student_attendance_cache_source_check,
    ADD CONSTRAINT student_attendance_cache_source_check 
    CHECK (source IN ('REAL', 'BOOTSTRAP', 'SYSTEM', 'ADMIN'));

ALTER TABLE public.student_fee_clearance_cache
    DROP CONSTRAINT IF EXISTS student_fee_clearance_cache_source_check,
    ADD CONSTRAINT student_fee_clearance_cache_source_check 
    CHECK (source IN ('REAL', 'BOOTSTRAP', 'ADMIN'));

-- 2. Enhance Fee Cache to support explicit status
ALTER TABLE public.student_fee_clearance_cache
    ADD COLUMN IF NOT EXISTS fee_status TEXT CHECK (fee_status IN ('PAID', 'PARTIAL', 'UNPAID', 'PENDING')) DEFAULT 'PENDING',
    ADD COLUMN IF NOT EXISTS last_updated_by UUID REFERENCES auth.users(id),
    ADD COLUMN IF NOT EXISTS remarks TEXT;

-- 3. Add audit column to Attendance Cache
ALTER TABLE public.student_attendance_cache
    ADD COLUMN IF NOT EXISTS last_updated_by UUID REFERENCES auth.users(id);

COMMIT;
