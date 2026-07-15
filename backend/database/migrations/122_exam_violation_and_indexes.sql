-- ==================================================
-- Migration: 122_exam_violation_and_indexes.sql
-- Bounded Context: Examination Platform Foundation
-- ==================================================

BEGIN;

-- Create exam_violation_log table
CREATE TABLE IF NOT EXISTS public.exam_violation_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_id UUID REFERENCES public.assessment_attempts(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    session_id UUID REFERENCES public.assessment_sessions(id) ON DELETE CASCADE NOT NULL,
    violation_type TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    browser_metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    user_agent TEXT,
    ip_address TEXT,
    severity TEXT CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')) DEFAULT 'MEDIUM' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Recommended Indexes for performance and quick query lookup
CREATE INDEX IF NOT EXISTS idx_exam_violation_log_attempt ON public.exam_violation_log(attempt_id);
CREATE INDEX IF NOT EXISTS idx_exam_violation_log_student ON public.exam_violation_log(student_id);
CREATE INDEX IF NOT EXISTS idx_exam_violation_log_session ON public.exam_violation_log(session_id);

CREATE INDEX IF NOT EXISTS idx_assessment_attempts_student_session ON public.assessment_attempts(student_id, session_id);
CREATE INDEX IF NOT EXISTS idx_assessment_sessions_times ON public.assessment_sessions(start_time, end_time);

-- Enable Row Level Security (RLS)
ALTER TABLE public.exam_violation_log ENABLE ROW LEVEL SECURITY;

-- Select policy: Candidates can view their own violations, staff/admin can view all.
DROP POLICY IF EXISTS "Select violation log" ON public.exam_violation_log;
CREATE POLICY "Select violation log" ON public.exam_violation_log
    FOR SELECT TO authenticated USING (
        auth.uid() IN (SELECT user_id FROM public.students WHERE id = student_id)
        OR EXISTS (
            SELECT 1 FROM public.assessment_sessions s
            WHERE s.id = session_id
            AND s.school_id = public.get_my_school_id()
        )
    );

-- Insert policy: Authenticated users can insert violation logs for their own attempts.
DROP POLICY IF EXISTS "Insert violation log" ON public.exam_violation_log;
CREATE POLICY "Insert violation log" ON public.exam_violation_log
    FOR INSERT TO authenticated WITH CHECK (
        auth.uid() IN (SELECT user_id FROM public.students WHERE id = student_id)
    );

COMMIT;
