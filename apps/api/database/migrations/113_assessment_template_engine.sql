-- ==================================================
-- Migration: 113_assessment_template_engine.sql
-- Bounded Context: Assessment Platform — Template Engine
-- ==================================================

BEGIN;

-- 1. ALTER EXISTING TEMPLATE HEADERS TABLE
ALTER TABLE public.assessment_templates
ADD COLUMN IF NOT EXISTS blueprint_id UUID REFERENCES public.assessment_blueprints(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- Remove old constraint on status and apply extended constraints check
ALTER TABLE public.assessment_templates
DROP CONSTRAINT IF EXISTS assessment_templates_status_check;

ALTER TABLE public.assessment_templates
ADD CONSTRAINT assessment_templates_status_check
CHECK (status IN ('DRAFT', 'UNDER_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED'));

-- 2. TEMPLATE LAYOUT RULES
CREATE TABLE IF NOT EXISTS public.assessment_template_layout_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES public.assessment_templates(id) ON DELETE CASCADE NOT NULL,
    property TEXT NOT NULL, -- 'page_size', 'orientation', 'font', 'columns', 'margin_top', 'line_spacing'
    value TEXT NOT NULL
);

-- 3. TEMPLATE HEADERS SCHEMAS
CREATE TABLE IF NOT EXISTS public.assessment_template_headers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES public.assessment_templates(id) ON DELETE CASCADE NOT NULL,
    institution_logo BOOLEAN DEFAULT true NOT NULL,
    school_name BOOLEAN DEFAULT true NOT NULL,
    exam_name BOOLEAN DEFAULT true NOT NULL,
    subject BOOLEAN DEFAULT true NOT NULL,
    class BOOLEAN DEFAULT true NOT NULL,
    academic_year BOOLEAN DEFAULT true NOT NULL,
    exam_date BOOLEAN DEFAULT true NOT NULL,
    duration BOOLEAN DEFAULT true NOT NULL,
    max_marks BOOLEAN DEFAULT true NOT NULL,
    student_name BOOLEAN DEFAULT true NOT NULL,
    hall_ticket BOOLEAN DEFAULT true NOT NULL,
    signature_block BOOLEAN DEFAULT true NOT NULL,
    qr_code BOOLEAN DEFAULT false NOT NULL,
    barcode BOOLEAN DEFAULT false NOT NULL
);

-- 4. TEMPLATE FOOTERS SCHEMAS
CREATE TABLE IF NOT EXISTS public.assessment_template_footers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES public.assessment_templates(id) ON DELETE CASCADE NOT NULL,
    invigilator_signature BOOLEAN DEFAULT true NOT NULL,
    chief_superintendent BOOLEAN DEFAULT true NOT NULL,
    generated_timestamp BOOLEAN DEFAULT true NOT NULL,
    page_number BOOLEAN DEFAULT true NOT NULL,
    confidential_watermark BOOLEAN DEFAULT false NOT NULL,
    qr_verification BOOLEAN DEFAULT false NOT NULL,
    instructions_footer BOOLEAN DEFAULT true NOT NULL
);

-- 5. TEMPLATE INSTRUCTIONS
CREATE TABLE IF NOT EXISTS public.assessment_template_instructions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES public.assessment_templates(id) ON DELETE CASCADE NOT NULL,
    instructions_text TEXT NOT NULL
);

-- 6. PREVIEW CACHE STORAGE
CREATE TABLE IF NOT EXISTS public.assessment_template_preview_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES public.assessment_templates(id) ON DELETE CASCADE NOT NULL,
    format TEXT NOT NULL, -- 'html', 'pdf', 'mobile'
    hash TEXT NOT NULL,
    html_path TEXT,
    pdf_path TEXT,
    thumbnail_path TEXT,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- 7. NORMALIZED BLUEPRINT ENGINE RULES TABLES
CREATE TABLE IF NOT EXISTS public.assessment_blueprint_difficulty_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blueprint_id UUID REFERENCES public.assessment_blueprints(id) ON DELETE CASCADE NOT NULL,
    difficulty_level TEXT NOT NULL, -- 'EASY', 'MEDIUM', 'HARD'
    percentage NUMERIC(5,2) NOT NULL CHECK (percentage >= 0 AND percentage <= 100)
);

CREATE TABLE IF NOT EXISTS public.assessment_blueprint_bloom_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blueprint_id UUID REFERENCES public.assessment_blueprints(id) ON DELETE CASCADE NOT NULL,
    bloom_level TEXT NOT NULL,
    percentage NUMERIC(5,2) NOT NULL CHECK (percentage >= 0 AND percentage <= 100)
);

CREATE TABLE IF NOT EXISTS public.assessment_blueprint_outcomes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blueprint_id UUID REFERENCES public.assessment_blueprints(id) ON DELETE CASCADE NOT NULL,
    outcome_code TEXT NOT NULL,
    target_questions INT NOT NULL CHECK (target_questions >= 0)
);

CREATE TABLE IF NOT EXISTS public.assessment_blueprint_randomization_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blueprint_id UUID REFERENCES public.assessment_blueprints(id) ON DELETE CASCADE NOT NULL,
    shuffle_questions BOOLEAN DEFAULT true NOT NULL,
    shuffle_options BOOLEAN DEFAULT true NOT NULL,
    alternative_pool_size INT DEFAULT 0 NOT NULL
);

CREATE TABLE IF NOT EXISTS public.assessment_blueprint_validation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blueprint_id UUID REFERENCES public.assessment_blueprints(id) ON DELETE CASCADE NOT NULL,
    validation_status TEXT NOT NULL CHECK (validation_status IN ('PASS', 'WARNING', 'FAIL')),
    errors JSONB NOT NULL DEFAULT '[]'::jsonb,
    warnings JSONB NOT NULL DEFAULT '[]'::jsonb,
    validated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    validated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.assessment_template_layout_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_template_headers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_template_footers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_template_instructions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_template_preview_cache ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.assessment_blueprint_difficulty_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_blueprint_bloom_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_blueprint_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_blueprint_randomization_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_blueprint_validation_logs ENABLE ROW LEVEL SECURITY;

-- Dynamic select policies mappings
DROP POLICY IF EXISTS "Tenant select layout" ON public.assessment_template_layout_rules;
CREATE POLICY "Tenant select layout" ON public.assessment_template_layout_rules FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.assessment_templates t WHERE t.id = public.assessment_template_layout_rules.template_id AND t.school_id = public.get_my_school_id())
);

DROP POLICY IF EXISTS "Admin select layout" ON public.assessment_template_layout_rules;
CREATE POLICY "Admin select layout" ON public.assessment_template_layout_rules FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.assessment_templates t WHERE t.id = public.assessment_template_layout_rules.template_id AND t.school_id = public.get_my_school_id())
);

DROP POLICY IF EXISTS "Tenant select header" ON public.assessment_template_headers;
CREATE POLICY "Tenant select header" ON public.assessment_template_headers FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.assessment_templates t WHERE t.id = public.assessment_template_headers.template_id AND t.school_id = public.get_my_school_id())
);

DROP POLICY IF EXISTS "Admin select header" ON public.assessment_template_headers;
CREATE POLICY "Admin select header" ON public.assessment_template_headers FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.assessment_templates t WHERE t.id = public.assessment_template_headers.template_id AND t.school_id = public.get_my_school_id())
);

DROP POLICY IF EXISTS "Tenant select footer" ON public.assessment_template_footers;
CREATE POLICY "Tenant select footer" ON public.assessment_template_footers FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.assessment_templates t WHERE t.id = public.assessment_template_footers.template_id AND t.school_id = public.get_my_school_id())
);

DROP POLICY IF EXISTS "Admin select footer" ON public.assessment_template_footers;
CREATE POLICY "Admin select footer" ON public.assessment_template_footers FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.assessment_templates t WHERE t.id = public.assessment_template_footers.template_id AND t.school_id = public.get_my_school_id())
);

DROP POLICY IF EXISTS "Tenant select instructions" ON public.assessment_template_instructions;
CREATE POLICY "Tenant select instructions" ON public.assessment_template_instructions FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.assessment_templates t WHERE t.id = public.assessment_template_instructions.template_id AND t.school_id = public.get_my_school_id())
);

DROP POLICY IF EXISTS "Admin select instructions" ON public.assessment_template_instructions;
CREATE POLICY "Admin select instructions" ON public.assessment_template_instructions FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.assessment_templates t WHERE t.id = public.assessment_template_instructions.template_id AND t.school_id = public.get_my_school_id())
);

-- Indexes for performance lookups
CREATE INDEX IF NOT EXISTS idx_template_layout_rules_tmp ON public.assessment_template_layout_rules(template_id);
CREATE INDEX IF NOT EXISTS idx_template_headers_tmp ON public.assessment_template_headers(template_id);
CREATE INDEX IF NOT EXISTS idx_template_footers_tmp ON public.assessment_template_footers(template_id);
CREATE INDEX IF NOT EXISTS idx_template_preview_cache_tmp ON public.assessment_template_preview_cache(template_id);

COMMIT;
