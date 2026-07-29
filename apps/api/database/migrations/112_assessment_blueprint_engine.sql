-- ==================================================
-- Migration: 112_assessment_blueprint_engine.sql
-- Bounded Context: Assessment Platform — Blueprint Engine
-- ==================================================

BEGIN;

-- 1. BLUEPRINT HEADER TABLE
CREATE TABLE IF NOT EXISTS public.assessment_blueprints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    total_marks NUMERIC(6,2) NOT NULL DEFAULT 100.00 CHECK (total_marks > 0),
    difficulty_distribution JSONB NOT NULL DEFAULT '{}'::jsonb,
    bloom_distribution JSONB NOT NULL DEFAULT '{}'::jsonb,
    outcome_mapping JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL CHECK (status IN ('DRAFT', 'UNDER_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED')) DEFAULT 'DRAFT',
    version INT NOT NULL DEFAULT 1 CHECK (version >= 1),
    parent_id UUID REFERENCES public.assessment_blueprints(id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. BLUEPRINT SECTIONS TABLE
CREATE TABLE IF NOT EXISTS public.assessment_blueprint_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blueprint_id UUID REFERENCES public.assessment_blueprints(id) ON DELETE CASCADE NOT NULL,
    section_name TEXT NOT NULL,
    description TEXT,
    points_per_question NUMERIC(5,2) DEFAULT 1.00 NOT NULL CHECK (points_per_question >= 0),
    negative_marks NUMERIC(5,2) DEFAULT 0.00 CHECK (negative_marks >= 0),
    total_questions INT NOT NULL CHECK (total_questions > 0),
    sort_order INT NOT NULL CHECK (sort_order >= 1)
);

-- 3. BLUEPRINT RULES TABLE
CREATE TABLE IF NOT EXISTS public.assessment_blueprint_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_id UUID REFERENCES public.assessment_blueprint_sections(id) ON DELETE CASCADE NOT NULL,
    filter_field TEXT NOT NULL, -- 'difficulty', 'bloom_level', 'tags', 'course_outcome'
    filter_value TEXT NOT NULL,
    match_operator TEXT NOT NULL DEFAULT 'eq'
);

-- 4. BLUEPRINT VERSIONS TABLE
CREATE TABLE IF NOT EXISTS public.assessment_blueprint_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blueprint_id UUID REFERENCES public.assessment_blueprints(id) ON DELETE CASCADE NOT NULL,
    version INT NOT NULL,
    schema_snapshot JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 5. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.assessment_blueprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_blueprint_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_blueprint_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_blueprint_versions ENABLE ROW LEVEL SECURITY;

-- 6. RLS POLICIES
-- Blueprints
DROP POLICY IF EXISTS "Tenant select blueprint" ON public.assessment_blueprints;
CREATE POLICY "Tenant select blueprint" ON public.assessment_blueprints
    FOR SELECT TO authenticated USING (school_id = public.get_my_school_id());

DROP POLICY IF EXISTS "Admin/Teacher manage blueprint" ON public.assessment_blueprints;
CREATE POLICY "Admin/Teacher manage blueprint" ON public.assessment_blueprints
    FOR ALL TO authenticated USING (school_id = public.get_my_school_id());

-- Blueprint Sections
DROP POLICY IF EXISTS "Tenant select blueprint section" ON public.assessment_blueprint_sections;
CREATE POLICY "Tenant select blueprint section" ON public.assessment_blueprint_sections
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.assessment_blueprints b
            WHERE b.id = public.assessment_blueprint_sections.blueprint_id
            AND b.school_id = public.get_my_school_id()
        )
    );

DROP POLICY IF EXISTS "Admin/Teacher manage blueprint section" ON public.assessment_blueprint_sections;
CREATE POLICY "Admin/Teacher manage blueprint section" ON public.assessment_blueprint_sections
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.assessment_blueprints b
            WHERE b.id = public.assessment_blueprint_sections.blueprint_id
            AND b.school_id = public.get_my_school_id()
        )
    );

-- Blueprint Rules
DROP POLICY IF EXISTS "Tenant select blueprint rule" ON public.assessment_blueprint_rules;
CREATE POLICY "Tenant select blueprint rule" ON public.assessment_blueprint_rules
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.assessment_blueprint_sections s
            JOIN public.assessment_blueprints b ON b.id = s.blueprint_id
            WHERE s.id = public.assessment_blueprint_rules.section_id
            AND b.school_id = public.get_my_school_id()
        )
    );

DROP POLICY IF EXISTS "Admin/Teacher manage blueprint rule" ON public.assessment_blueprint_rules;
CREATE POLICY "Admin/Teacher manage blueprint rule" ON public.assessment_blueprint_rules
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.assessment_blueprint_sections s
            JOIN public.assessment_blueprints b ON b.id = s.blueprint_id
            WHERE s.id = public.assessment_blueprint_rules.section_id
            AND b.school_id = public.get_my_school_id()
        )
    );

-- Blueprint Versions
DROP POLICY IF EXISTS "Tenant select blueprint version" ON public.assessment_blueprint_versions;
CREATE POLICY "Tenant select blueprint version" ON public.assessment_blueprint_versions
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.assessment_blueprints b
            WHERE b.id = public.assessment_blueprint_versions.blueprint_id
            AND b.school_id = public.get_my_school_id()
        )
    );

DROP POLICY IF EXISTS "Admin/Teacher manage blueprint version" ON public.assessment_blueprint_versions;
CREATE POLICY "Admin/Teacher manage blueprint version" ON public.assessment_blueprint_versions
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.assessment_blueprints b
            WHERE b.id = public.assessment_blueprint_versions.blueprint_id
            AND b.school_id = public.get_my_school_id()
        )
    );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_assessment_blueprints_subject ON public.assessment_blueprints(subject_id);
CREATE INDEX IF NOT EXISTS idx_assessment_blueprints_parent ON public.assessment_blueprints(parent_id);
CREATE INDEX IF NOT EXISTS idx_assessment_blueprint_sections_bp ON public.assessment_blueprint_sections(blueprint_id);
CREATE INDEX IF NOT EXISTS idx_assessment_blueprint_rules_sec ON public.assessment_blueprint_rules(section_id);

COMMIT;
