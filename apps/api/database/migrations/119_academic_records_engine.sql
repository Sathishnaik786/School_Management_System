-- ==================================================
-- Migration: 119_academic_records_engine.sql
-- Bounded Context: Student Academic Records & Graduation Engine
-- ==================================================

BEGIN;

-- 1. STUDENT ACADEMIC RECORDS
CREATE TABLE IF NOT EXISTS public.student_academic_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL,
    cgpa NUMERIC(4,2) NOT NULL DEFAULT 0.00,
    total_credits INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
ALTER TABLE public.student_academic_records ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE;

-- 2. ACADEMIC TERMS TOTALS
CREATE TABLE IF NOT EXISTS public.student_academic_terms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academic_record_id UUID REFERENCES public.student_academic_records(id) ON DELETE CASCADE NOT NULL,
    term_id UUID NOT NULL,
    gpa NUMERIC(4,2) NOT NULL DEFAULT 0.00,
    earned_credits INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 3. ACADEMIC SUBJECTS SCORES
CREATE TABLE IF NOT EXISTS public.student_academic_subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academic_term_id UUID REFERENCES public.student_academic_terms(id) ON DELETE CASCADE NOT NULL,
    subject_id UUID NOT NULL,
    grade_point NUMERIC(4,2) NOT NULL DEFAULT 0.00,
    grade_label TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('PASS', 'FAIL', 'BACKLOG')) DEFAULT 'PASS'
);

-- 4. IMMUTABLE SNAPSHOTS LAYERS
CREATE TABLE IF NOT EXISTS public.student_academic_record_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academic_record_id UUID REFERENCES public.student_academic_records(id) ON DELETE CASCADE NOT NULL,
    snapshot_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    snapshot_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 5. STUDENT ACADEMIC TIMELINE LOGS
CREATE TABLE IF NOT EXISTS public.student_academic_timeline (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL,
    event_type TEXT NOT NULL, -- e.g. PROMOTED, GPA_UPDATED, PLACED_ON_PROBATION
    event_description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 6. CONFIGURABLE STANDING RULES
CREATE TABLE IF NOT EXISTS public.academic_standing_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    min_gpa NUMERIC(4,2) NOT NULL DEFAULT 5.00,
    max_backlogs INT NOT NULL DEFAULT 0,
    resulting_status TEXT NOT NULL CHECK (resulting_status IN ('GOOD_STANDING', 'WARNING', 'PROBATION', 'SUSPENSION', 'HONORS'))
);

-- 7. ACADEMIC STANDINGS STATUS
CREATE TABLE IF NOT EXISTS public.student_academic_standing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL,
    current_standing TEXT NOT NULL CHECK (current_standing IN ('GOOD_STANDING', 'WARNING', 'PROBATION', 'SUSPENSION', 'HONORS')) DEFAULT 'GOOD_STANDING',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 8. WARNINGS HISTORICAL LOGS
CREATE TABLE IF NOT EXISTS public.student_warning_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL,
    reason TEXT NOT NULL,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 9. PROBATION HISTORICAL LOGS
CREATE TABLE IF NOT EXISTS public.student_probation_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL,
    reason TEXT NOT NULL,
    placed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    cleared_at TIMESTAMP WITH TIME ZONE
);

-- 10. HONORS ROLL HISTORY
CREATE TABLE IF NOT EXISTS public.student_honors_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL,
    honor_title TEXT NOT NULL,
    awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 11. GRADUATION AUDIT REQUIREMENTS
CREATE TABLE IF NOT EXISTS public.graduation_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    min_credits INT NOT NULL DEFAULT 120,
    min_cgpa NUMERIC(4,2) NOT NULL DEFAULT 6.00
);

-- 12. GRADUATION STUDENT AUDITS
CREATE TABLE IF NOT EXISTS public.graduation_audit (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL,
    audit_status TEXT NOT NULL CHECK (audit_status IN ('ELIGIBLE', 'INCOMPLETE')) DEFAULT 'INCOMPLETE',
    credits_completed INT NOT NULL DEFAULT 0,
    cgpa_score NUMERIC(4,2) NOT NULL DEFAULT 0.00,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 13. INDEPENDENT CLEARANCES NOCs
CREATE TABLE IF NOT EXISTS public.graduation_clearance_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL,
    clearance_type TEXT NOT NULL CHECK (clearance_type IN ('Library', 'Finance', 'Hostel', 'Transport', 'Department', 'ExamCell', 'Placement', 'Alumni')),
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'CLEARED')) DEFAULT 'PENDING',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 14. GRADUATION CANDIDATES STATS
CREATE TABLE IF NOT EXISTS public.graduation_candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('ELIGIBLE', 'UNDER_REVIEW', 'CLEARANCE_PENDING', 'APPROVED', 'GRADUATED', 'CERTIFICATE_GENERATED', 'ARCHIVED')) DEFAULT 'ELIGIBLE',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 15. OFFICIAL TRANSCRIPTS REGISTRY
CREATE TABLE IF NOT EXISTS public.official_transcripts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL,
    pdf_url TEXT NOT NULL,
    is_official BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 16. TRANSCRIPT VERSIONS AUDITS
CREATE TABLE IF NOT EXISTS public.transcript_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transcript_id UUID REFERENCES public.official_transcripts(id) ON DELETE CASCADE NOT NULL,
    version_number INT NOT NULL DEFAULT 1,
    snapshot_hash TEXT NOT NULL
);

-- 17. MULTI-ROLE TRANSCRIPT SIGNATURES
CREATE TABLE IF NOT EXISTS public.transcript_signatures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transcript_id UUID REFERENCES public.official_transcripts(id) ON DELETE CASCADE NOT NULL,
    signatory_role TEXT NOT NULL CHECK (signatory_role IN ('COE', 'REGISTRAR', 'PRINCIPAL')),
    signed_hash TEXT NOT NULL,
    signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 18. TRANSCRIPT REQUESTS LIFE TIMELINE
CREATE TABLE IF NOT EXISTS public.transcript_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Requested', 'Fee Pending', 'Payment Complete', 'Processing', 'Generated', 'Signed', 'Dispatched', 'Delivered')) DEFAULT 'Requested',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 19. NORMALIZED DEGREE REQUIREMENT RULES
CREATE TABLE IF NOT EXISTS public.degree_requirement_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID NOT NULL,
    group_name TEXT NOT NULL,
    required_credits INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.degree_requirement_courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES public.degree_requirement_groups(id) ON DELETE CASCADE NOT NULL,
    subject_id UUID NOT NULL,
    is_core BOOLEAN NOT NULL DEFAULT true
);

-- Row Level Security policies
ALTER TABLE public.student_academic_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_academic_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_academic_standing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.official_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transcript_requests ENABLE ROW LEVEL SECURITY;

-- Tenant select policies
CREATE POLICY "Tenant select records" ON public.student_academic_records FOR SELECT TO authenticated USING (
    school_id = public.get_my_school_id()
);
CREATE POLICY "Admin manage records" ON public.student_academic_records FOR ALL TO authenticated USING (
    school_id = public.get_my_school_id()
);

COMMIT;
