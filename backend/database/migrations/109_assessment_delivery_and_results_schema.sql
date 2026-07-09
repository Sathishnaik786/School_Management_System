-- ==================================================
-- Migration: 109_assessment_delivery_and_results_schema.sql
-- Bounded Context: Assessment Platform & Result Engine
-- ==================================================

BEGIN;

-- 1. ASSESSMENT PUBLISHED PAPERS TABLE
CREATE TABLE IF NOT EXISTS public.assessment_published_papers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    template_version_id UUID REFERENCES public.assessment_template_versions(id) ON DELETE SET NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
    paper_name TEXT NOT NULL,
    total_marks NUMERIC(6,2) NOT NULL CHECK (total_marks >= 0),
    questions_structure JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of snapshot questions and options
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. ASSESSMENT SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.assessment_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    published_paper_id UUID REFERENCES public.assessment_published_papers(id) ON DELETE CASCADE NOT NULL,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INT NOT NULL CHECK (duration_minutes > 0),
    late_join_cutoff_minutes INT DEFAULT 15 CHECK (late_join_cutoff_minutes >= 0),
    password TEXT, -- Optional entrance check
    proctoring_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT CHECK (status IN ('SCHEDULED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED')) DEFAULT 'SCHEDULED' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT check_session_dates CHECK (start_time < end_time)
);

-- 3. ASSESSMENT ATTEMPTS TABLE
CREATE TABLE IF NOT EXISTS public.assessment_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.assessment_sessions(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    status TEXT CHECK (status IN ('IN_PROGRESS', 'SUBMITTED', 'GRADED', 'SUSPENDED')) DEFAULT 'IN_PROGRESS' NOT NULL,
    browser_state JSONB NOT NULL DEFAULT '{}'::jsonb, -- Autosaved telemetry
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE,
    last_heartbeat_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    autosaved_answers JSONB NOT NULL DEFAULT '{}'::jsonb, -- Draft answers map
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_student_session_attempt UNIQUE (session_id, student_id)
);

-- 4. ASSESSMENT MARKS DETAIL TABLE
CREATE TABLE IF NOT EXISTS public.assessment_marks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_id UUID REFERENCES public.assessment_attempts(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES public.assessment_question_bank(id) ON DELETE CASCADE NOT NULL,
    student_answer JSONB NOT NULL DEFAULT '{}'::jsonb,
    auto_score NUMERIC(5,2) DEFAULT 0.00 CHECK (auto_score >= 0),
    manual_score NUMERIC(5,2) CHECK (manual_score >= 0),
    evaluator_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    evaluation_status TEXT CHECK (evaluation_status IN ('PENDING', 'AUTO_GRADED', 'MANUALLY_GRADED')) DEFAULT 'PENDING' NOT NULL,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_attempt_question_marks UNIQUE (attempt_id, question_id)
);

-- 5. OFFLINE IMPORT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.assessment_import_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    session_id UUID REFERENCES public.assessment_sessions(id) ON DELETE SET NULL,
    imported_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    file_url TEXT NOT NULL,
    records_count INT DEFAULT 0 NOT NULL,
    success_count INT DEFAULT 0 NOT NULL,
    failure_count INT DEFAULT 0 NOT NULL,
    status TEXT CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')) DEFAULT 'PENDING' NOT NULL,
    error_details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 6. OFFLINE SYNC CONFLICTS TABLE
CREATE TABLE IF NOT EXISTS public.assessment_sync_conflicts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_id UUID REFERENCES public.assessment_attempts(id) ON DELETE CASCADE NOT NULL,
    conflict_type TEXT CHECK (conflict_type IN ('DUPLICATE_ATTEMPT', 'TIMELINE_OVERLAP', 'VERSION_MISMATCH')) NOT NULL,
    offline_data JSONB NOT NULL,
    online_data JSONB NOT NULL,
    resolution TEXT CHECK (resolution IN ('PENDING', 'RESOLVED_USE_OFFLINE', 'RESOLVED_USE_ONLINE', 'RESOLVED_MERGED')) DEFAULT 'PENDING' NOT NULL,
    resolved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 7. RESULT ENGINE POLICY RULES TABLE
CREATE TABLE IF NOT EXISTS public.result_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
    rule_name TEXT NOT NULL,
    rule_type TEXT CHECK (rule_type IN ('WEIGHTAGE', 'GRACE_MARKS', 'CGPA_FORMULA')) NOT NULL,
    rule_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_school_year_rule UNIQUE (school_id, academic_year_id, rule_name)
);

-- 8. ASSESSMENT GRADING SCALES TABLE
CREATE TABLE IF NOT EXISTS public.assessment_grading_scales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    scale_config JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of grade thresholds, e.g., [{"grade": "A+", "min": 90}]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_school_assessment_grading_scale_name UNIQUE (school_id, name)
);

-- 9. STUDENT SUBJECT RESULTS TABLE
CREATE TABLE IF NOT EXISTS public.student_subject_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
    exam_term TEXT NOT NULL, -- e.g., 'MIDTERM', 'ANNUAL'
    marks_obtained NUMERIC(6,2) NOT NULL CHECK (marks_obtained >= 0),
    total_marks NUMERIC(6,2) NOT NULL CHECK (total_marks >= 0),
    grade TEXT NOT NULL,
    grade_points NUMERIC(4,2) NOT NULL,
    status TEXT CHECK (status IN ('PASS', 'FAIL', 'ABSENT', 'WITHHELD')) DEFAULT 'PASS' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT check_obtained_marks CHECK (marks_obtained <= total_marks),
    CONSTRAINT unique_student_subject_term UNIQUE (student_id, subject_id, exam_term)
);

-- 10. STUDENT YEAR SUMMARIES (CGPA/GPA) TABLE
CREATE TABLE IF NOT EXISTS public.student_year_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
    gpa NUMERIC(4,2) CHECK (gpa >= 0.00 AND gpa <= 10.00),
    cgpa NUMERIC(4,2) CHECK (cgpa >= 0.00 AND cgpa <= 10.00),
    credits_earned INT DEFAULT 0 CHECK (credits_earned >= 0),
    total_credits INT DEFAULT 0 CHECK (total_credits >= 0),
    rank INT CHECK (rank >= 1),
    percentile NUMERIC(5,2) CHECK (percentile >= 0.00 AND percentile <= 100.00),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_student_year_summary UNIQUE (student_id, academic_year_id)
);

-- 11. RESULT PUBLICATIONS CONTROL TABLE
CREATE TABLE IF NOT EXISTS public.result_publications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
    exam_term TEXT NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE,
    published_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    is_released BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_school_year_term_publication UNIQUE (school_id, academic_year_id, exam_term)
);

-- 12. RESULT ENGINE AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.result_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    target_result_id UUID NOT NULL,
    action_type TEXT CHECK (action_type IN ('INSERT', 'UPDATE', 'DELETE', 'GRACE_MARKS_APPLIED')) NOT NULL,
    old_value JSONB,
    new_value JSONB,
    performed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 13. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.assessment_published_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_import_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_sync_conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.result_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_grading_scales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_subject_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_year_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.result_publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.result_audit_logs ENABLE ROW LEVEL SECURITY;

-- 14. RLS POLICIES

-- Published Papers
DROP POLICY IF EXISTS "Tenant select published papers" ON public.assessment_published_papers;
CREATE POLICY "Tenant select published papers" ON public.assessment_published_papers
    FOR SELECT TO authenticated USING (school_id = public.get_my_school_id());

DROP POLICY IF EXISTS "Admin/Teacher manage published papers" ON public.assessment_published_papers;
CREATE POLICY "Admin/Teacher manage published papers" ON public.assessment_published_papers
    FOR ALL TO authenticated USING (school_id = public.get_my_school_id());

-- Sessions
DROP POLICY IF EXISTS "Tenant select sessions" ON public.assessment_sessions;
CREATE POLICY "Tenant select sessions" ON public.assessment_sessions
    FOR SELECT TO authenticated USING (school_id = public.get_my_school_id());

DROP POLICY IF EXISTS "Admin/Teacher manage sessions" ON public.assessment_sessions;
CREATE POLICY "Admin/Teacher manage sessions" ON public.assessment_sessions
    FOR ALL TO authenticated USING (school_id = public.get_my_school_id());

-- Attempts
DROP POLICY IF EXISTS "Tenant select attempts" ON public.assessment_attempts;
CREATE POLICY "Tenant select attempts" ON public.assessment_attempts
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.assessment_sessions s
            WHERE s.id = session_id
            AND s.school_id = public.get_my_school_id()
        )
    );

DROP POLICY IF EXISTS "Admin/Teacher/Student manage attempts" ON public.assessment_attempts;
CREATE POLICY "Admin/Teacher/Student manage attempts" ON public.assessment_attempts
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.assessment_sessions s
            WHERE s.id = session_id
            AND s.school_id = public.get_my_school_id()
        )
    );

-- Marks
DROP POLICY IF EXISTS "Tenant select marks" ON public.assessment_marks;
CREATE POLICY "Tenant select marks" ON public.assessment_marks
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.assessment_attempts a
            JOIN public.assessment_sessions s ON s.id = a.session_id
            WHERE a.id = attempt_id
            AND s.school_id = public.get_my_school_id()
        )
    );

DROP POLICY IF EXISTS "Admin/Teacher manage marks" ON public.assessment_marks;
CREATE POLICY "Admin/Teacher manage marks" ON public.assessment_marks
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.assessment_attempts a
            JOIN public.assessment_sessions s ON s.id = a.session_id
            WHERE a.id = attempt_id
            AND s.school_id = public.get_my_school_id()
        )
    );

-- Subject Results
DROP POLICY IF EXISTS "Tenant select subject results" ON public.student_subject_results;
CREATE POLICY "Tenant select subject results" ON public.student_subject_results
    FOR SELECT TO authenticated USING (school_id = public.get_my_school_id());

DROP POLICY IF EXISTS "Admin/Teacher manage subject results" ON public.student_subject_results;
CREATE POLICY "Admin/Teacher manage subject results" ON public.student_subject_results
    FOR ALL TO authenticated USING (school_id = public.get_my_school_id());

-- Year Summaries
DROP POLICY IF EXISTS "Tenant select summaries" ON public.student_year_summaries;
CREATE POLICY "Tenant select summaries" ON public.student_year_summaries
    FOR SELECT TO authenticated USING (school_id = public.get_my_school_id());

DROP POLICY IF EXISTS "Admin manage summaries" ON public.student_year_summaries;
CREATE POLICY "Admin manage summaries" ON public.student_year_summaries
    FOR ALL TO authenticated USING (school_id = public.get_my_school_id());

-- 15. PERFORMANCE INDICES
CREATE INDEX IF NOT EXISTS idx_assessment_pub_papers_school ON public.assessment_published_papers(school_id);
CREATE INDEX IF NOT EXISTS idx_assessment_sessions_paper ON public.assessment_sessions(published_paper_id);
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_session ON public.assessment_attempts(session_id);
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_student ON public.assessment_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_assessment_marks_attempt ON public.assessment_marks(attempt_id);
CREATE INDEX IF NOT EXISTS idx_student_subject_results_student ON public.student_subject_results(student_id);
CREATE INDEX IF NOT EXISTS idx_student_year_summaries_student ON public.student_year_summaries(student_id);

-- 16. TIMESTAMP UPDATES
DROP TRIGGER IF EXISTS trg_update_assessment_sessions_timestamp ON public.assessment_sessions;
CREATE TRIGGER trg_update_assessment_sessions_timestamp
    BEFORE UPDATE ON public.assessment_sessions
    FOR EACH ROW EXECUTE FUNCTION public.fn_update_timestamp();

DROP TRIGGER IF EXISTS trg_update_assessment_attempts_timestamp ON public.assessment_attempts;
CREATE TRIGGER trg_update_assessment_attempts_timestamp
    BEFORE UPDATE ON public.assessment_attempts
    FOR EACH ROW EXECUTE FUNCTION public.fn_update_timestamp();

DROP TRIGGER IF EXISTS trg_update_assessment_marks_timestamp ON public.assessment_marks;
CREATE TRIGGER trg_update_assessment_marks_timestamp
    BEFORE UPDATE ON public.assessment_marks
    FOR EACH ROW EXECUTE FUNCTION public.fn_update_timestamp();

DROP TRIGGER IF EXISTS trg_update_student_subject_results_timestamp ON public.student_subject_results;
CREATE TRIGGER trg_update_student_subject_results_timestamp
    BEFORE UPDATE ON public.student_subject_results
    FOR EACH ROW EXECUTE FUNCTION public.fn_update_timestamp();

DROP TRIGGER IF EXISTS trg_update_student_year_summaries_timestamp ON public.student_year_summaries;
CREATE TRIGGER trg_update_student_year_summaries_timestamp
    BEFORE UPDATE ON public.student_year_summaries
    FOR EACH ROW EXECUTE FUNCTION public.fn_update_timestamp();

COMMIT;
