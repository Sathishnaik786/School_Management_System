-- ==================================================
-- 101_admission_assessment_engine.sql
-- Bounded Context: Admission Assessment Engine
-- ==================================================

BEGIN;

-- 1. ADMISSION SUBJECTS MASTER TABLE
CREATE TABLE IF NOT EXISTS public.admission_subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    code TEXT UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Altering admission templates table to add version, lock, and evaluation type
ALTER TABLE public.admission_exam_templates 
ADD COLUMN IF NOT EXISTS version INT NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS evaluation_type TEXT CHECK (evaluation_type IN ('AUTO', 'MANUAL', 'HYBRID')) DEFAULT 'MANUAL';

-- Ensure version is tracked safely per grade
ALTER TABLE public.admission_exam_templates 
DROP CONSTRAINT IF EXISTS unique_grade;

ALTER TABLE public.admission_exam_templates 
DROP CONSTRAINT IF EXISTS unique_grade_version;

ALTER TABLE public.admission_exam_templates 
ADD CONSTRAINT unique_grade_version UNIQUE (grade, version);

-- 2. REUSABLE QUESTION POOL
CREATE TABLE IF NOT EXISTS public.admission_question_bank (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    subject_id UUID REFERENCES public.admission_subjects(id) ON DELETE RESTRICT NOT NULL,
    question_text TEXT NOT NULL,
    question_type TEXT CHECK (question_type IN (
        'MCQ', 'TRUE_FALSE', 'SUBJECTIVE', 'MULTIPLE_SELECT', 
        'MATCH_FOLLOWING', 'FILL_BLANKS', 'NUMERICAL', 'CODING', 
        'AUDIO_RESPONSE', 'VIDEO_RESPONSE', 'FILE_UPLOAD'
    )) NOT NULL,
    difficulty TEXT CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')) DEFAULT 'MEDIUM',
    points NUMERIC(5,2) NOT NULL DEFAULT 1.00,
    negative_marks NUMERIC(5,2) DEFAULT 0.00,
    randomize_options BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Question Options (for MCQ/True-False/Multiple-Select)
CREATE TABLE IF NOT EXISTS public.admission_question_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID REFERENCES public.admission_question_bank(id) ON DELETE CASCADE NOT NULL,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Template Sections
CREATE TABLE IF NOT EXISTS public.admission_assessment_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES public.admission_exam_templates(id) ON DELETE CASCADE NOT NULL,
    section_name TEXT NOT NULL,
    max_marks NUMERIC(5,2) NOT NULL,
    sort_order INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Question Mappings (Links Questions to Sections with sorting)
CREATE TABLE IF NOT EXISTS public.admission_assessment_question_mapping (
    section_id UUID REFERENCES public.admission_assessment_sections(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES public.admission_question_bank(id) ON DELETE RESTRICT NOT NULL,
    sort_order INT NOT NULL DEFAULT 1,
    PRIMARY KEY (section_id, question_id)
);

-- 3. SCHEDULING POLICIES TABLE
CREATE TABLE IF NOT EXISTS public.admission_assessment_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schedule_id UUID REFERENCES public.admission_exam_schedule(id) ON DELETE CASCADE UNIQUE NOT NULL,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    allow_early_login_mins INT DEFAULT 15,
    grace_period_mins INT DEFAULT 10,
    late_entry_mins INT DEFAULT 15,
    allow_resume BOOLEAN DEFAULT true,
    auto_submit_on_expiry BOOLEAN DEFAULT true,
    max_attempts INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ASSESSMENT SNAPSHOT TABLES
CREATE TABLE IF NOT EXISTS public.admission_assessment_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    template_id UUID REFERENCES public.admission_exam_templates(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    grade TEXT NOT NULL,
    version INT NOT NULL,
    duration INT NOT NULL,
    total_marks NUMERIC(5,2) NOT NULL,
    passing_marks NUMERIC(5,2) NOT NULL,
    evaluation_type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.admission_assessment_snapshot_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    snapshot_id UUID REFERENCES public.admission_assessment_snapshots(id) ON DELETE CASCADE NOT NULL,
    question_id UUID NOT NULL, -- Logical reference
    section_name TEXT NOT NULL,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL,
    points NUMERIC(5,2) NOT NULL,
    negative_marks NUMERIC(5,2) NOT NULL,
    sort_order INT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.admission_assessment_snapshot_question_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    snapshot_question_id UUID REFERENCES public.admission_assessment_snapshot_questions(id) ON DELETE CASCADE NOT NULL,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT false
);

-- 5. SESSION, ATTEMPTS, RESPONSES & TELEMETRY TABLES
CREATE TABLE IF NOT EXISTS public.admission_assessment_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    candidate_allocation_id UUID REFERENCES public.admission_exam_session_candidates(id) ON DELETE CASCADE NOT NULL,
    otp_hash TEXT NOT NULL,
    otp_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    exam_token_hash TEXT,
    ip_address TEXT,
    browser_agent TEXT,
    last_heartbeat_at TIMESTAMP WITH TIME ZONE,
    status TEXT CHECK (status IN ('CREATED', 'ACTIVE', 'DISCONNECTED', 'COMPLETED')) DEFAULT 'CREATED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.admission_assessment_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    session_id UUID REFERENCES public.admission_assessment_sessions(id) ON DELETE CASCADE NOT NULL,
    snapshot_id UUID REFERENCES public.admission_assessment_snapshots(id) ON DELETE RESTRICT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    submit_time TIMESTAMP WITH TIME ZONE,
    status TEXT CHECK (status IN ('STARTED', 'ONGOING', 'SUBMITTED', 'EXPIRED')) DEFAULT 'STARTED',
    evaluation_status TEXT CHECK (evaluation_status IN (
        'DRAFT', 'AUTO_EVALUATED', 'MANUAL_REVIEWED', 'APPROVED', 'PUBLISHED'
    )) DEFAULT 'DRAFT',
    score_obtained NUMERIC(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.admission_assessment_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_id UUID REFERENCES public.admission_assessment_attempts(id) ON DELETE CASCADE NOT NULL,
    snapshot_question_id UUID REFERENCES public.admission_assessment_snapshot_questions(id) ON DELETE RESTRICT NOT NULL,
    selected_option_id UUID REFERENCES public.admission_assessment_snapshot_question_options(id) ON DELETE SET NULL,
    text_answer TEXT,
    time_spent_seconds INT DEFAULT 0,
    marks_awarded NUMERIC(5,2),
    is_correct BOOLEAN,
    graded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    graded_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT unique_attempt_snap_question UNIQUE (attempt_id, snapshot_question_id)
);

CREATE TABLE IF NOT EXISTS public.admission_assessment_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.admission_assessment_sessions(id) ON DELETE CASCADE NOT NULL,
    event_type TEXT CHECK (event_type IN (
        'TAB_SWITCH', 'WINDOW_BLUR', 'COPY', 'PASTE', 'FULLSCREEN_EXIT', 
        'NETWORK_DISCONNECT', 'CAMERA_BLOCKED', 'MIC_BLOCKED', 'REFRESH', 
        'BACK_BUTTON', 'DEVTOOLS_OPENED', 'BROWSER_RESIZED', 'IDLE_TIMEOUT', 'RECONNECT'
    )) NOT NULL,
    details JSONB,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.admission_assessment_outbox (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    status TEXT CHECK (status IN ('PENDING', 'PROCESSED', 'FAILED')) DEFAULT 'PENDING',
    error_log TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- 6. ENABLE ROW LEVEL SECURITY (RLS) & INDEXING
ALTER TABLE public.admission_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admission_question_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admission_question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admission_assessment_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admission_assessment_question_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admission_assessment_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admission_assessment_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admission_assessment_snapshot_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admission_assessment_snapshot_question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admission_assessment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admission_assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admission_assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admission_assessment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admission_assessment_outbox ENABLE ROW LEVEL SECURITY;

-- Dynamic query helpers
CREATE OR REPLACE FUNCTION public.get_my_school_id()
RETURNS UUID AS $$
    SELECT school_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policies Configuration (Multi-Tenancy Enforced)
DROP POLICY IF EXISTS "Tenant read subjects" ON public.admission_subjects;
DROP POLICY IF EXISTS "Admin write subjects" ON public.admission_subjects;
CREATE POLICY "Tenant read subjects" ON public.admission_subjects FOR SELECT TO authenticated USING (school_id = public.get_my_school_id() OR public.is_admin());
CREATE POLICY "Admin write subjects" ON public.admission_subjects FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Tenant read question bank" ON public.admission_question_bank;
DROP POLICY IF EXISTS "Admin write question bank" ON public.admission_question_bank;
CREATE POLICY "Tenant read question bank" ON public.admission_question_bank FOR SELECT TO authenticated USING (school_id = public.get_my_school_id() OR public.is_admin());
CREATE POLICY "Admin write question bank" ON public.admission_question_bank FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Tenant read snapshots" ON public.admission_assessment_snapshots;
DROP POLICY IF EXISTS "Tenant manage snapshots" ON public.admission_assessment_snapshots;
CREATE POLICY "Tenant read snapshots" ON public.admission_assessment_snapshots FOR SELECT TO authenticated USING (school_id = public.get_my_school_id() OR public.is_admin());
CREATE POLICY "Tenant manage snapshots" ON public.admission_assessment_snapshots FOR ALL TO authenticated USING (school_id = public.get_my_school_id() OR public.is_admin());

-- Candidate reads their own session/attempt
DROP POLICY IF EXISTS "Candidate read own session" ON public.admission_assessment_sessions;
DROP POLICY IF EXISTS "Candidate insert own session" ON public.admission_assessment_sessions;
DROP POLICY IF EXISTS "Candidate update own session" ON public.admission_assessment_sessions;
CREATE POLICY "Candidate read own session" ON public.admission_assessment_sessions FOR SELECT TO authenticated USING (school_id = public.get_my_school_id());
CREATE POLICY "Candidate insert own session" ON public.admission_assessment_sessions FOR INSERT TO authenticated WITH CHECK (school_id = public.get_my_school_id());
CREATE POLICY "Candidate update own session" ON public.admission_assessment_sessions FOR UPDATE TO authenticated USING (school_id = public.get_my_school_id());

DROP POLICY IF EXISTS "Candidate read own attempt" ON public.admission_assessment_attempts;
DROP POLICY IF EXISTS "Candidate insert own attempt" ON public.admission_assessment_attempts;
DROP POLICY IF EXISTS "Candidate update own attempt" ON public.admission_assessment_attempts;
CREATE POLICY "Candidate read own attempt" ON public.admission_assessment_attempts FOR SELECT TO authenticated USING (school_id = public.get_my_school_id());
CREATE POLICY "Candidate insert own attempt" ON public.admission_assessment_attempts FOR INSERT TO authenticated WITH CHECK (school_id = public.get_my_school_id());
CREATE POLICY "Candidate update own attempt" ON public.admission_assessment_attempts FOR UPDATE TO authenticated USING (school_id = public.get_my_school_id());

DROP POLICY IF EXISTS "Candidate manage responses" ON public.admission_assessment_responses;
CREATE POLICY "Candidate manage responses" ON public.admission_assessment_responses FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.admission_assessment_attempts a
        WHERE a.id = public.admission_assessment_responses.attempt_id
        AND a.school_id = public.get_my_school_id()
    )
);

DROP POLICY IF EXISTS "Candidate insert events" ON public.admission_assessment_events;
CREATE POLICY "Candidate insert events" ON public.admission_assessment_events FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.admission_assessment_sessions s
        WHERE s.id = public.admission_assessment_events.session_id
        AND s.school_id = public.get_my_school_id()
    )
);

DROP POLICY IF EXISTS "Tenant read outbox" ON public.admission_assessment_outbox;
DROP POLICY IF EXISTS "Tenant write outbox" ON public.admission_assessment_outbox;
CREATE POLICY "Tenant read outbox" ON public.admission_assessment_outbox FOR SELECT TO authenticated USING (school_id = public.get_my_school_id() OR public.is_admin());
CREATE POLICY "Tenant write outbox" ON public.admission_assessment_outbox FOR ALL TO authenticated USING (school_id = public.get_my_school_id() OR public.is_admin());

-- Indexes for performance queries
CREATE INDEX IF NOT EXISTS idx_assessment_question_bank_subject ON public.admission_question_bank(subject_id);
CREATE INDEX IF NOT EXISTS idx_assessment_snapshots_template ON public.admission_assessment_snapshots(template_id);
CREATE INDEX IF NOT EXISTS idx_assessment_snapshot_questions_snap ON public.admission_assessment_snapshot_questions(snapshot_id);
CREATE INDEX IF NOT EXISTS idx_assessment_snapshot_options_question ON public.admission_assessment_snapshot_question_options(snapshot_question_id);
CREATE INDEX IF NOT EXISTS idx_assessment_sessions_candidate ON public.admission_assessment_sessions(candidate_allocation_id);
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_session ON public.admission_assessment_attempts(session_id);
CREATE INDEX IF NOT EXISTS idx_assessment_responses_attempt ON public.admission_assessment_responses(attempt_id);
CREATE INDEX IF NOT EXISTS idx_assessment_events_session ON public.admission_assessment_events(session_id);
CREATE INDEX IF NOT EXISTS idx_assessment_outbox_status ON public.admission_assessment_outbox(status);

COMMIT;
