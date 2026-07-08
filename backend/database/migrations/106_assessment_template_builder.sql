-- ==================================================
-- Migration: 106_assessment_template_builder.sql
-- Bounded Context: Assessment Platform — Template Builder
-- ==================================================

BEGIN;

-- 1. TEMPLATES HEADER TABLE
CREATE TABLE IF NOT EXISTS public.assessment_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    version INT NOT NULL DEFAULT 1 CHECK (version >= 1),
    status TEXT CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')) DEFAULT 'DRAFT' NOT NULL,
    is_deleted BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. TEMPLATE SECTIONS TABLE
CREATE TABLE IF NOT EXISTS public.assessment_template_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES public.assessment_templates(id) ON DELETE CASCADE NOT NULL,
    section_name TEXT NOT NULL,
    description TEXT,
    points_per_question NUMERIC(5,2) DEFAULT 1.00 NOT NULL CHECK (points_per_question >= 0),
    negative_marks NUMERIC(5,2) DEFAULT 0.00 CHECK (negative_marks >= 0),
    total_questions INT NOT NULL CHECK (total_questions > 0),
    sort_order INT NOT NULL CHECK (sort_order >= 1)
);

-- 3. TEMPLATE SECTIONS RULES/FILTERS TABLE
CREATE TABLE IF NOT EXISTS public.assessment_template_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_id UUID REFERENCES public.assessment_template_sections(id) ON DELETE CASCADE NOT NULL,
    filter_field TEXT NOT NULL, -- 'difficulty', 'bloom_level', 'tags', 'course_outcome', 'program_outcome'
    filter_value TEXT NOT NULL,
    match_operator TEXT NOT NULL DEFAULT 'eq'
);

-- 4. TEMPLATEBlueprints IMMUTABLE SNAPSHOTS TABLE
CREATE TABLE IF NOT EXISTS public.assessment_template_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES public.assessment_templates(id) ON DELETE CASCADE NOT NULL,
    version INT NOT NULL,
    schema_snapshot JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 5. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.assessment_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_template_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_template_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_template_versions ENABLE ROW LEVEL SECURITY;

-- 6. RLS POLICIES
-- Templates
DROP POLICY IF EXISTS "Tenant select template" ON public.assessment_templates;
CREATE POLICY "Tenant select template" ON public.assessment_templates
    FOR SELECT TO authenticated USING (school_id = public.get_my_school_id() AND is_deleted = false);

DROP POLICY IF EXISTS "Admin/Teacher manage template" ON public.assessment_templates;
CREATE POLICY "Admin/Teacher manage template" ON public.assessment_templates
    FOR ALL TO authenticated USING (school_id = public.get_my_school_id());

-- Template Sections
DROP POLICY IF EXISTS "Tenant select section" ON public.assessment_template_sections;
CREATE POLICY "Tenant select section" ON public.assessment_template_sections
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.assessment_templates t
            WHERE t.id = public.assessment_template_sections.template_id
            AND t.school_id = public.get_my_school_id()
            AND t.is_deleted = false
        )
    );

DROP POLICY IF EXISTS "Admin/Teacher manage section" ON public.assessment_template_sections;
CREATE POLICY "Admin/Teacher manage section" ON public.assessment_template_sections
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.assessment_templates t
            WHERE t.id = public.assessment_template_sections.template_id
            AND t.school_id = public.get_my_school_id()
        )
    );

-- Template Rules
DROP POLICY IF EXISTS "Tenant select rule" ON public.assessment_template_rules;
CREATE POLICY "Tenant select rule" ON public.assessment_template_rules
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.assessment_template_sections s
            JOIN public.assessment_templates t ON t.id = s.template_id
            WHERE s.id = public.assessment_template_rules.section_id
            AND t.school_id = public.get_my_school_id()
            AND t.is_deleted = false
        )
    );

DROP POLICY IF EXISTS "Admin/Teacher manage rule" ON public.assessment_template_rules;
CREATE POLICY "Admin/Teacher manage rule" ON public.assessment_template_rules
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.assessment_template_sections s
            JOIN public.assessment_templates t ON t.id = s.template_id
            WHERE s.id = public.assessment_template_rules.section_id
            AND t.school_id = public.get_my_school_id()
        )
    );

-- Template Versions
DROP POLICY IF EXISTS "Tenant select version" ON public.assessment_template_versions;
CREATE POLICY "Tenant select version" ON public.assessment_template_versions
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.assessment_templates t
            WHERE t.id = public.assessment_template_versions.template_id
            AND t.school_id = public.get_my_school_id()
            AND t.is_deleted = false
        )
    );

DROP POLICY IF EXISTS "Admin/Teacher manage version" ON public.assessment_template_versions;
CREATE POLICY "Admin/Teacher manage version" ON public.assessment_template_versions
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.assessment_templates t
            WHERE t.id = public.assessment_template_versions.template_id
            AND t.school_id = public.get_my_school_id()
        )
    );

-- 7. PERFORMANCE INDICES
CREATE INDEX IF NOT EXISTS idx_assessment_templates_school_sub ON public.assessment_templates(school_id, subject_id) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_assessment_t_sections_t ON public.assessment_template_sections(template_id);
CREATE INDEX IF NOT EXISTS idx_assessment_t_rules_s ON public.assessment_template_rules(section_id);
CREATE INDEX IF NOT EXISTS idx_assessment_t_versions_t ON public.assessment_template_versions(template_id);

-- 8. TIMESTAMP UPDATE TRIGGERS
DROP TRIGGER IF EXISTS trg_update_assessment_templates_timestamp ON public.assessment_templates;
CREATE TRIGGER trg_update_assessment_templates_timestamp
    BEFORE UPDATE ON public.assessment_templates
    FOR EACH ROW EXECUTE FUNCTION public.fn_update_timestamp();

COMMIT;
