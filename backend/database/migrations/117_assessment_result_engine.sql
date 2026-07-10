-- ==================================================
-- Migration: 117_assessment_result_engine.sql
-- Bounded Context: Assessment Platform — Result Processing & Publication Engine
-- ==================================================

BEGIN;

-- 1. RESULT CALCULATION SESSIONS
CREATE TABLE IF NOT EXISTS public.assessment_result_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    academic_year_id UUID NOT NULL,
    term_id UUID NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('DRAFT', 'CALCULATED', 'UNDER_VERIFICATION', 'APPROVED', 'PUBLISHED', 'LOCKED')) DEFAULT 'DRAFT',
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. STUDENT DYNAMIC RESULTS
CREATE TABLE IF NOT EXISTS public.assessment_student_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.assessment_result_sessions(id) ON DELETE CASCADE NOT NULL,
    student_id UUID NOT NULL,
    raw_marks_sum NUMERIC(6,2) NOT NULL DEFAULT 0.00,
    scaled_marks_sum NUMERIC(6,2) NOT NULL DEFAULT 0.00,
    grace_marks_sum NUMERIC(6,2) NOT NULL DEFAULT 0.00,
    final_percentage NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    gpa NUMERIC(4,2) NOT NULL DEFAULT 0.00,
    cgpa NUMERIC(4,2) NOT NULL DEFAULT 0.00,
    total_credits INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 3. SUBJECT MARKS AGGREGATES
CREATE TABLE IF NOT EXISTS public.assessment_subject_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_result_id UUID REFERENCES public.assessment_student_results(id) ON DELETE CASCADE NOT NULL,
    subject_id UUID NOT NULL,
    awarded_marks NUMERIC(6,2) NOT NULL DEFAULT 0.00,
    maximum_marks NUMERIC(6,2) NOT NULL,
    grade_label TEXT NOT NULL,
    grade_point NUMERIC(4,2) NOT NULL DEFAULT 0.00
);

-- 4. SEMESTER GPAS SUMMARY
CREATE TABLE IF NOT EXISTS public.assessment_semester_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL,
    semester_label TEXT NOT NULL,
    gpa NUMERIC(4,2) NOT NULL DEFAULT 0.00,
    earned_credits INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 5. STUDENT GRADE CARDS
CREATE TABLE IF NOT EXISTS public.assessment_grade_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_result_id UUID REFERENCES public.assessment_student_results(id) ON DELETE CASCADE NOT NULL,
    issue_number TEXT NOT NULL UNIQUE,
    issued_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 6. OFFICIAL STUDENT TRANSCRIPTS
CREATE TABLE IF NOT EXISTS public.assessment_transcripts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL,
    academic_record_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_official BOOLEAN NOT NULL DEFAULT false,
    issued_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 7. RESULT PUBLICATIONS
CREATE TABLE IF NOT EXISTS public.assessment_result_publications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.assessment_result_sessions(id) ON DELETE CASCADE NOT NULL,
    target_portal TEXT NOT NULL CHECK (target_portal IN ('STUDENT_PORTAL', 'PARENT_PORTAL', 'PUBLIC_WEBSITE', 'MOBILE_APP')) DEFAULT 'STUDENT_PORTAL',
    published_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 8. APPROVAL WORKFLOW HISTORY
CREATE TABLE IF NOT EXISTS public.assessment_result_approval_workflow (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.assessment_result_sessions(id) ON DELETE CASCADE NOT NULL,
    approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    role_level TEXT NOT NULL CHECK (role_level IN ('VERIFIER', 'APPROVER', 'CONTROLLER_OF_EXAMINATION', 'PRINCIPAL')),
    decision TEXT NOT NULL CHECK (decision IN ('PENDING', 'APPROVED', 'REJECTED')),
    comments TEXT,
    signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 9. FREEZE TRANSACTION LOGS
CREATE TABLE IF NOT EXISTS public.assessment_result_freeze_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.assessment_result_sessions(id) ON DELETE CASCADE NOT NULL,
    frozen_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    frozen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 10. DIGITAL SIGNATURES SNAPSHOTS
CREATE TABLE IF NOT EXISTS public.assessment_result_signatures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.assessment_result_sessions(id) ON DELETE CASCADE NOT NULL,
    principal_signature TEXT,
    coe_signature TEXT,
    director_signature TEXT,
    system_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 11. INSTITUTIONAL RESULT STATISTICS
CREATE TABLE IF NOT EXISTS public.assessment_result_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.assessment_result_sessions(id) ON DELETE CASCADE NOT NULL,
    pass_pct NUMERIC(5,2) NOT NULL DEFAULT 100.00,
    fail_pct NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    average_gpa NUMERIC(4,2) NOT NULL DEFAULT 0.00,
    median_gpa NUMERIC(4,2) NOT NULL DEFAULT 0.00,
    standard_deviation NUMERIC(6,2) NOT NULL DEFAULT 0.00,
    distinction_count INT NOT NULL DEFAULT 0,
    first_class_count INT NOT NULL DEFAULT 0
);

-- 12. COHORT rankings
CREATE TABLE IF NOT EXISTS public.assessment_rankings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.assessment_result_sessions(id) ON DELETE CASCADE NOT NULL,
    student_id UUID NOT NULL,
    cgpa NUMERIC(4,2) NOT NULL,
    merit_rank INT NOT NULL CHECK (merit_rank >= 1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 13. NOTIFICATION LOGS
CREATE TABLE IF NOT EXISTS public.assessment_result_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL,
    medium TEXT NOT NULL CHECK (medium IN ('EMAIL', 'SMS', 'PUSH_NOTIFICATION', 'WHATSAPP')),
    message TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'SENT', 'FAILED')) DEFAULT 'PENDING',
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 14. VERSIONING LOGS
CREATE TABLE IF NOT EXISTS public.assessment_result_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.assessment_result_sessions(id) ON DELETE CASCADE NOT NULL,
    version_number INT NOT NULL DEFAULT 1 CHECK (version_number >= 1),
    calculation_hash TEXT NOT NULL,
    parameters_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 15. PDF EXPORT ARCHIVES
CREATE TABLE IF NOT EXISTS public.assessment_result_exports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.assessment_result_sessions(id) ON DELETE CASCADE NOT NULL,
    format TEXT NOT NULL CHECK (format IN ('PDF', 'EXCEL', 'CSV', 'JSON', 'XML')),
    type TEXT NOT NULL CHECK (type IN ('grade_card', 'transcript', 'gazette', 'merit_list')),
    file_path TEXT NOT NULL,
    checksum TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 16. PROMOTION DECISIONS
CREATE TABLE IF NOT EXISTS public.assessment_promotion_decisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL,
    academic_year_id UUID NOT NULL,
    decision TEXT NOT NULL CHECK (decision IN ('PASS', 'PROMOTED', 'PROMOTED WITH BACKLOG', 'COMPARTMENT', 'REPEAT', 'WITHHELD', 'MALPRACTICE', 'TRANSFERRED', 'INCOMPLETE')),
    remarks TEXT,
    decided_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 17. BACKLOG SUBJECTS MAPPING
CREATE TABLE IF NOT EXISTS public.assessment_backlog_subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL,
    subject_id UUID NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'CLEARED', 'RETRAY')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 18. CERTIFICATE TEMPLATES
CREATE TABLE IF NOT EXISTS public.assessment_certificate_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    styles_css TEXT,
    layout_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 19. CERTIFICATE QUEUE
CREATE TABLE IF NOT EXISTS public.assessment_certificate_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL,
    template_id UUID REFERENCES public.assessment_certificate_templates(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('QUEUED', 'GENERATED', 'FAILED')) DEFAULT 'QUEUED',
    error_message TEXT,
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 20. IMMUTABLE SNAPSHOT - OFFICIAL STUDENT RESULTS
CREATE TABLE IF NOT EXISTS public.assessment_official_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    student_id UUID NOT NULL,
    academic_year_id UUID NOT NULL,
    term_id UUID NOT NULL,
    final_percentage NUMERIC(5,2) NOT NULL,
    gpa NUMERIC(4,2) NOT NULL,
    cgpa NUMERIC(4,2) NOT NULL,
    total_credits INT NOT NULL,
    signed_hash TEXT NOT NULL,
    archived_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 21. IMMUTABLE SNAPSHOT - OFFICIAL SUBJECT MARKS
CREATE TABLE IF NOT EXISTS public.assessment_official_subject_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    official_result_id UUID REFERENCES public.assessment_official_results(id) ON DELETE CASCADE NOT NULL,
    subject_id UUID NOT NULL,
    awarded_marks NUMERIC(6,2) NOT NULL,
    maximum_marks NUMERIC(6,2) NOT NULL,
    grade_label TEXT NOT NULL,
    grade_point NUMERIC(4,2) NOT NULL
);

-- 22. IMMUTABLE SNAPSHOT - OFFICIAL GRADECARDS
CREATE TABLE IF NOT EXISTS public.assessment_official_gradecards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    official_result_id UUID REFERENCES public.assessment_official_results(id) ON DELETE CASCADE NOT NULL,
    gradecard_pdf_url TEXT NOT NULL,
    checksum TEXT NOT NULL,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 23. IMMUTABLE SNAPSHOT - OFFICIAL TRANSCRIPTS
CREATE TABLE IF NOT EXISTS public.assessment_official_transcripts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL,
    transcript_pdf_url TEXT NOT NULL,
    checksum TEXT NOT NULL,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 24. RESULT AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.assessment_result_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.assessment_result_sessions(id) ON DELETE CASCADE NOT NULL,
    action TEXT NOT NULL,
    performed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- RLS MAPPINGS
ALTER TABLE public.assessment_result_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_student_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_subject_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_semester_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_grade_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_result_publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_result_approval_workflow ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_result_freeze_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_result_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_result_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_result_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_result_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_result_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_promotion_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_backlog_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_certificate_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_certificate_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_official_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_official_subject_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_official_gradecards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_official_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_result_audit_logs ENABLE ROW LEVEL SECURITY;

-- Tenant select permissions
CREATE POLICY "Tenant select sessions" ON public.assessment_result_sessions FOR SELECT TO authenticated USING (
    school_id = public.get_my_school_id()
);
CREATE POLICY "Admin manage sessions" ON public.assessment_result_sessions FOR ALL TO authenticated USING (
    school_id = public.get_my_school_id()
);

CREATE POLICY "Tenant select official results" ON public.assessment_official_results FOR SELECT TO authenticated USING (
    school_id = public.get_my_school_id()
);
CREATE POLICY "Admin manage official results" ON public.assessment_official_results FOR ALL TO authenticated USING (
    school_id = public.get_my_school_id()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_res_sess_school ON public.assessment_result_sessions(school_id);
CREATE INDEX IF NOT EXISTS idx_off_res_school ON public.assessment_official_results(school_id);

COMMIT;
