-- ==================================================
-- Migration: 105_assessment_question_bank.sql
-- Bounded Context: Assessment Platform — Question Engine
-- ==================================================

BEGIN;

-- 1. FOLDERS TABLE
CREATE TABLE IF NOT EXISTS public.assessment_folders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    parent_id UUID REFERENCES public.assessment_folders(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    is_deleted BOOLEAN DEFAULT false NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. QUESTION BANK TABLE
CREATE TABLE IF NOT EXISTS public.assessment_question_bank (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
    campus_id UUID,
    program_id UUID,
    department_id UUID,
    folder_id UUID REFERENCES public.assessment_folders(id) ON DELETE SET NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
    
    question_text TEXT NOT NULL,
    question_type TEXT CHECK (question_type IN ('MCQ', 'TRUE_FALSE', 'SUBJECTIVE', 'MULTIPLE_SELECT', 'FILL_BLANKS', 'CODING', 'SQL')) NOT NULL,
    difficulty TEXT CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')) DEFAULT 'MEDIUM' NOT NULL,
    bloom_level TEXT CHECK (bloom_level IN ('REMEMBER', 'UNDERSTAND', 'APPLY', 'ANALYZE', 'EVALUATE', 'CREATE')) DEFAULT 'REMEMBER' NOT NULL,
    points NUMERIC(5,2) DEFAULT 1.00 NOT NULL CHECK (points >= 0),
    negative_marks NUMERIC(5,2) DEFAULT 0.00 CHECK (negative_marks >= 0),
    explanation TEXT,
    
    -- Outcomes mapping
    course_outcome_code TEXT,
    program_outcome_code TEXT,
    lesson_id UUID,
    
    taxonomy_tags JSONB DEFAULT '[]'::jsonb NOT NULL,
    version INT NOT NULL DEFAULT 1 CHECK (version >= 1),
    status TEXT CHECK (status IN ('DRAFT', 'UNDER_REVIEW', 'APPROVED', 'ARCHIVED')) DEFAULT 'DRAFT' NOT NULL,
    parent_id UUID REFERENCES public.assessment_question_bank(id) ON DELETE SET NULL,
    search_vector TSVECTOR,
    
    is_deleted BOOLEAN DEFAULT false NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 3. QUESTION OPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.assessment_question_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID REFERENCES public.assessment_question_bank(id) ON DELETE CASCADE NOT NULL,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT false NOT NULL,
    is_deleted BOOLEAN DEFAULT false NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 4. QUESTION ASSETS REGISTER TABLE
CREATE TABLE IF NOT EXISTS public.assessment_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL, -- Supabase Storage link
    mime_type TEXT NOT NULL,
    file_size INT NOT NULL CHECK (file_size > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 5. QUESTION-TO-ASSET MAP TABLE
CREATE TABLE IF NOT EXISTS public.assessment_question_assets (
    question_id UUID REFERENCES public.assessment_question_bank(id) ON DELETE CASCADE NOT NULL,
    asset_id UUID REFERENCES public.assessment_assets(id) ON DELETE CASCADE NOT NULL,
    PRIMARY KEY (question_id, asset_id)
);

-- 6. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.assessment_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_question_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_question_assets ENABLE ROW LEVEL SECURITY;

-- 7. RLS POLICIES
-- Folders
DROP POLICY IF EXISTS "Tenant select folder" ON public.assessment_folders;
CREATE POLICY "Tenant select folder" ON public.assessment_folders
    FOR SELECT TO authenticated USING (school_id = public.get_my_school_id() AND is_deleted = false);

DROP POLICY IF EXISTS "Admin/Teacher manage folder" ON public.assessment_folders;
CREATE POLICY "Admin/Teacher manage folder" ON public.assessment_folders
    FOR ALL TO authenticated USING (school_id = public.get_my_school_id());

-- Question Bank
DROP POLICY IF EXISTS "Tenant select question" ON public.assessment_question_bank;
CREATE POLICY "Tenant select question" ON public.assessment_question_bank
    FOR SELECT TO authenticated USING (school_id = public.get_my_school_id() AND is_deleted = false);

DROP POLICY IF EXISTS "Admin/Teacher manage question" ON public.assessment_question_bank;
CREATE POLICY "Admin/Teacher manage question" ON public.assessment_question_bank
    FOR ALL TO authenticated USING (school_id = public.get_my_school_id());

-- Question Options
DROP POLICY IF EXISTS "Tenant select option" ON public.assessment_question_options;
CREATE POLICY "Tenant select option" ON public.assessment_question_options
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.assessment_question_bank q
            WHERE q.id = public.assessment_question_options.question_id
            AND q.school_id = public.get_my_school_id()
            AND q.is_deleted = false
        )
    );

DROP POLICY IF EXISTS "Admin/Teacher manage option" ON public.assessment_question_options;
CREATE POLICY "Admin/Teacher manage option" ON public.assessment_question_options
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.assessment_question_bank q
            WHERE q.id = public.assessment_question_options.question_id
            AND q.school_id = public.get_my_school_id()
        )
    );

-- Assets
DROP POLICY IF EXISTS "Tenant select asset" ON public.assessment_assets;
CREATE POLICY "Tenant select asset" ON public.assessment_assets
    FOR SELECT TO authenticated USING (school_id = public.get_my_school_id());

DROP POLICY IF EXISTS "Admin/Teacher manage asset" ON public.assessment_assets;
CREATE POLICY "Admin/Teacher manage asset" ON public.assessment_assets
    FOR ALL TO authenticated USING (school_id = public.get_my_school_id());

-- Question Assets Map
DROP POLICY IF EXISTS "Tenant select question asset" ON public.assessment_question_assets;
CREATE POLICY "Tenant select question asset" ON public.assessment_question_assets
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.assessment_question_bank q
            WHERE q.id = public.assessment_question_assets.question_id
            AND q.school_id = public.get_my_school_id()
        )
    );

DROP POLICY IF EXISTS "Admin/Teacher manage question asset" ON public.assessment_question_assets;
CREATE POLICY "Admin/Teacher manage question asset" ON public.assessment_question_assets
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.assessment_question_bank q
            WHERE q.id = public.assessment_question_assets.question_id
            AND q.school_id = public.get_my_school_id()
        )
    );

-- 8. INDEXES & GIN VECTOR SEARCH
CREATE INDEX IF NOT EXISTS idx_assessment_folders_school ON public.assessment_folders(school_id) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_assessment_q_bank_school_sub ON public.assessment_question_bank(school_id, subject_id) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_assessment_q_bank_folder ON public.assessment_question_bank(folder_id) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_assessment_q_options_q ON public.assessment_question_options(question_id);

-- GIN Trigger updates search_vector on insert/update
CREATE OR REPLACE FUNCTION public.fn_assessment_question_bank_tsvector_trigger()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    to_tsvector('english', coalesce(NEW.question_text, '')) ||
    to_tsvector('english', coalesce(NEW.explanation, '')) ||
    jsonb_to_tsvector('english', coalesce(NEW.taxonomy_tags, '[]'::jsonb), '["all"]');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_assessment_question_bank_tsvector ON public.assessment_question_bank;
CREATE TRIGGER trg_assessment_question_bank_tsvector
  BEFORE INSERT OR UPDATE ON public.assessment_question_bank
  FOR EACH ROW EXECUTE FUNCTION public.fn_assessment_question_bank_tsvector_trigger();

CREATE INDEX IF NOT EXISTS idx_assessment_q_bank_search ON public.assessment_question_bank USING GIN(search_vector);

-- 9. TIMESTAMP UPDATE TRIGGERS
DROP TRIGGER IF EXISTS trg_update_assessment_folders_timestamp ON public.assessment_folders;
CREATE TRIGGER trg_update_assessment_folders_timestamp
    BEFORE UPDATE ON public.assessment_folders
    FOR EACH ROW EXECUTE FUNCTION public.fn_update_timestamp();

DROP TRIGGER IF EXISTS trg_update_assessment_question_bank_timestamp ON public.assessment_question_bank;
CREATE TRIGGER trg_update_assessment_question_bank_timestamp
    BEFORE UPDATE ON public.assessment_question_bank
    FOR EACH ROW EXECUTE FUNCTION public.fn_update_timestamp();

COMMIT;
