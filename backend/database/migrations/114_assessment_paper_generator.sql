-- ==================================================
-- Migration: 114_assessment_paper_generator.sql
-- Bounded Context: Assessment Platform — Paper Generator Engine
-- ==================================================

BEGIN;

-- 1. GENERATED PAPERS AGGREGATE
CREATE TABLE IF NOT EXISTS public.assessment_generated_papers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
    blueprint_id UUID REFERENCES public.assessment_blueprints(id) ON DELETE SET NULL,
    template_id UUID REFERENCES public.assessment_templates(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    total_marks NUMERIC(6,2) NOT NULL DEFAULT 100.00 CHECK (total_marks > 0),
    status TEXT NOT NULL CHECK (status IN ('DRAFT', 'GENERATED', 'VALIDATED', 'APPROVED', 'PUBLISHED', 'ARCHIVED', 'CANCELLED')) DEFAULT 'DRAFT',
    version INT NOT NULL DEFAULT 1 CHECK (version >= 1),
    is_deleted BOOLEAN DEFAULT false NOT NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. GENERATED SECTIONS MAPPINGS
CREATE TABLE IF NOT EXISTS public.assessment_generated_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paper_id UUID REFERENCES public.assessment_generated_papers(id) ON DELETE CASCADE NOT NULL,
    section_name TEXT NOT NULL,
    description TEXT,
    points_per_question NUMERIC(6,2) NOT NULL DEFAULT 1.00,
    negative_marks NUMERIC(6,2) NOT NULL DEFAULT 0.00,
    total_questions INT NOT NULL CHECK (total_questions > 0),
    sort_order INT NOT NULL CHECK (sort_order >= 1)
);

-- 3. GENERATED QUESTIONS MAPPINGS
CREATE TABLE IF NOT EXISTS public.assessment_generated_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_id UUID REFERENCES public.assessment_generated_sections(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES public.assessment_question_bank(id) ON DELETE CASCADE NOT NULL,
    sort_order INT NOT NULL CHECK (sort_order >= 1)
);

-- 4. CONCURRENT GENERATION LOCKS
CREATE TABLE IF NOT EXISTS public.assessment_generation_locks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_type TEXT NOT NULL CHECK (resource_type IN ('BLUEPRINT', 'TEMPLATE')),
    resource_id UUID NOT NULL,
    locked_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    locked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 5. GENERATED PAPERS VALIDATION LOGS
CREATE TABLE IF NOT EXISTS public.assessment_generated_validation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paper_id UUID REFERENCES public.assessment_generated_papers(id) ON DELETE CASCADE NOT NULL,
    validation_status TEXT NOT NULL CHECK (validation_status IN ('PASS', 'WARNING', 'FAIL')),
    errors JSONB NOT NULL DEFAULT '[]'::jsonb,
    warnings JSONB NOT NULL DEFAULT '[]'::jsonb,
    validated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    validated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 6. GENERATION STATISTICS SUMMARY
CREATE TABLE IF NOT EXISTS public.assessment_generated_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paper_id UUID REFERENCES public.assessment_generated_papers(id) ON DELETE CASCADE NOT NULL,
    generation_duration_ms INT NOT NULL DEFAULT 0,
    blueprint_compliance_pct NUMERIC(5,2) NOT NULL DEFAULT 100.00,
    question_reuse_pct NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    difficulty_compliance_pct NUMERIC(5,2) NOT NULL DEFAULT 100.00,
    bloom_compliance_pct NUMERIC(5,2) NOT NULL DEFAULT 100.00,
    outcome_compliance_pct NUMERIC(5,2) NOT NULL DEFAULT 100.00
);

-- 7. GENERATION ASYNC JOBS QUEUE
CREATE TABLE IF NOT EXISTS public.assessment_generation_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    blueprint_id UUID REFERENCES public.assessment_blueprints(id) ON DELETE CASCADE NOT NULL,
    template_id UUID REFERENCES public.assessment_templates(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED')) DEFAULT 'PENDING',
    logs JSONB NOT NULL DEFAULT '[]'::jsonb,
    error_message TEXT,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 8. PUBLISHED IMMUTABLE PAPERS AGGREGATE
CREATE TABLE IF NOT EXISTS public.assessment_published_papers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
    generated_paper_id UUID REFERENCES public.assessment_generated_papers(id) ON DELETE SET NULL,
    blueprint_id UUID REFERENCES public.assessment_blueprints(id) ON DELETE SET NULL,
    template_id UUID REFERENCES public.assessment_templates(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    total_marks NUMERIC(6,2) NOT NULL DEFAULT 100.00,
    paper_hash TEXT NOT NULL, -- Integrity verify hash code
    published_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 9. PUBLISHED SECTIONS SNAPSHOTS
CREATE TABLE IF NOT EXISTS public.assessment_published_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    published_paper_id UUID REFERENCES public.assessment_published_papers(id) ON DELETE CASCADE NOT NULL,
    section_name TEXT NOT NULL,
    description TEXT,
    points_per_question NUMERIC(6,2) NOT NULL DEFAULT 1.00,
    negative_marks NUMERIC(6,2) NOT NULL DEFAULT 0.00,
    total_questions INT NOT NULL,
    sort_order INT NOT NULL
);

-- 10. PUBLISHED QUESTIONS SNAPSHOTS
CREATE TABLE IF NOT EXISTS public.assessment_published_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    published_section_id UUID REFERENCES public.assessment_published_sections(id) ON DELETE CASCADE NOT NULL,
    question_snapshot JSONB NOT NULL,
    options_snapshot JSONB NOT NULL DEFAULT '[]'::jsonb,
    asset_snapshot JSONB NOT NULL DEFAULT '[]'::jsonb,
    answer_key_snapshot JSONB NOT NULL DEFAULT '[]'::jsonb,
    question_order INT NOT NULL,
    option_order JSONB NOT NULL DEFAULT '[]'::jsonb, -- Shuffle mapping index
    section_order INT NOT NULL
);

-- 11. PAPERS PACKAGE ARTIFACTS
CREATE TABLE IF NOT EXISTS public.assessment_paper_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    published_paper_id UUID REFERENCES public.assessment_published_papers(id) ON DELETE CASCADE NOT NULL,
    candidate_pdf TEXT,
    moderator_pdf TEXT,
    answer_key_pdf TEXT,
    encrypted_package TEXT,
    checksum TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 12. GENERATED EXPORTS METADATA
CREATE TABLE IF NOT EXISTS public.assessment_generated_exports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paper_id UUID REFERENCES public.assessment_generated_papers(id) ON DELETE CASCADE NOT NULL,
    format TEXT NOT NULL CHECK (format IN ('PDF', 'DOCX', 'HTML', 'ZIP')),
    type TEXT NOT NULL CHECK (type IN ('candidate', 'moderator', 'answer_key')),
    file_path TEXT NOT NULL,
    generated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- RLS Enablement
ALTER TABLE public.assessment_generated_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_generated_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_generated_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_generation_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_generated_validation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_generated_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_generation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_published_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_published_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_published_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_paper_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_generated_exports ENABLE ROW LEVEL SECURITY;

-- Dynamic tenant security rules checks
CREATE POLICY "Tenant select paper" ON public.assessment_generated_papers FOR SELECT TO authenticated USING (
    school_id = public.get_my_school_id()
);
CREATE POLICY "Admin manage paper" ON public.assessment_generated_papers FOR ALL TO authenticated USING (
    school_id = public.get_my_school_id()
);

CREATE POLICY "Tenant select published paper" ON public.assessment_published_papers FOR SELECT TO authenticated USING (
    school_id = public.get_my_school_id()
);
CREATE POLICY "Admin manage published paper" ON public.assessment_published_papers FOR ALL TO authenticated USING (
    school_id = public.get_my_school_id()
);

CREATE POLICY "Tenant select job" ON public.assessment_generation_jobs FOR SELECT TO authenticated USING (
    school_id = public.get_my_school_id()
);
CREATE POLICY "Admin manage job" ON public.assessment_generation_jobs FOR ALL TO authenticated USING (
    school_id = public.get_my_school_id()
);

-- Performance indices
CREATE INDEX IF NOT EXISTS idx_gen_papers_school ON public.assessment_generated_papers(school_id);
CREATE INDEX IF NOT EXISTS idx_gen_papers_subject ON public.assessment_generated_papers(subject_id);
CREATE INDEX IF NOT EXISTS idx_pub_papers_school ON public.assessment_published_papers(school_id);
CREATE INDEX IF NOT EXISTS idx_gen_jobs_school ON public.assessment_generation_jobs(school_id);

COMMIT;
