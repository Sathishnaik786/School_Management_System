BEGIN;

-- 1. Create Source Enum/Column for Eligibility Snapshots
ALTER TABLE public.exam_eligibility_snapshots 
ADD COLUMN IF NOT EXISTS source TEXT CHECK (source IN ('REAL', 'OVERRIDE', 'BOOTSTRAP')) DEFAULT 'REAL';

-- 2. Create Attendance Cache Table (Safely)
-- Renamed from student_attendance_summary to avoid conflict with existing view.
-- Aggregated attendance used for high-level eligibility checks without scanning millions of daily records.
CREATE TABLE IF NOT EXISTS public.student_attendance_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
    term TEXT CHECK (term IN ('Q1', 'Q2', 'Q3', 'Q4', 'ANNUAL', 'OTHER')) DEFAULT 'ANNUAL',
    
    total_working_days INT DEFAULT 0,
    present_days INT DEFAULT 0,
    -- PostgreSQL 12+ Generated Column
    attendance_percentage NUMERIC(5,2) GENERATED ALWAYS AS (
        CASE WHEN total_working_days > 0 
             THEN ROUND((present_days::NUMERIC / total_working_days::NUMERIC) * 100, 2)
             ELSE 0 
        END
    ) STORED,
    
    source TEXT CHECK (source IN ('REAL', 'BOOTSTRAP', 'SYSTEM')) DEFAULT 'REAL',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(student_id, academic_year_id, term)
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_attend_cache_student ON public.student_attendance_cache(student_id);
CREATE INDEX IF NOT EXISTS idx_attend_cache_year ON public.student_attendance_cache(academic_year_id);

-- 3. Fee Clearance Cache Table (Optional but recommended by Architect)
-- To avoid querying complex fee structures during high-load exam checks.
CREATE TABLE IF NOT EXISTS public.student_fee_clearance_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
    term TEXT CHECK (term IN ('Q1', 'Q2', 'Q3', 'Q4', 'ANNUAL', 'OTHER')) DEFAULT 'ANNUAL',
    
    is_cleared BOOLEAN DEFAULT false,
    outstanding_amount NUMERIC(10,2) DEFAULT 0.00,
    last_checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source TEXT CHECK (source IN ('REAL', 'BOOTSTRAP')) DEFAULT 'REAL',

    UNIQUE(student_id, academic_year_id, term)
);

COMMIT;
