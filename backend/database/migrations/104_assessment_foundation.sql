-- ==================================================
-- Migration: 104_assessment_foundation.sql
-- Bounded Context: Assessment Platform
-- ==================================================

BEGIN;

-- 1. ASSESSMENT CONFIGURATIONS TABLE
CREATE TABLE IF NOT EXISTS public.assessment_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE UNIQUE NOT NULL,
    max_upload_size_mb INT DEFAULT 10 CHECK (max_upload_size_mb > 0 AND max_upload_size_mb <= 100),
    autosave_interval_secs INT DEFAULT 10 CHECK (autosave_interval_secs >= 5 AND autosave_interval_secs <= 60),
    default_heartbeat_secs INT DEFAULT 30 CHECK (default_heartbeat_secs >= 10 AND default_heartbeat_secs <= 120),
    timezone TEXT DEFAULT 'UTC' NOT NULL,
    grading_scale JSONB DEFAULT '[]'::jsonb NOT NULL,
    retention_telemetry_days INT DEFAULT 90 CHECK (retention_telemetry_days >= 30),
    retention_attempts_years INT DEFAULT 7 CHECK (retention_attempts_years >= 1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. WORKFLOW DEFINITIONS TABLE
CREATE TABLE IF NOT EXISTS public.assessment_workflow_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    version INT NOT NULL DEFAULT 1,
    is_deleted BOOLEAN DEFAULT false NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_school_workflow_name UNIQUE (school_id, name)
);

-- 3. WORKFLOW STEPS TABLE
CREATE TABLE IF NOT EXISTS public.assessment_workflow_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID REFERENCES public.assessment_workflow_definitions(id) ON DELETE CASCADE NOT NULL,
    step_name TEXT NOT NULL,
    role_required TEXT NOT NULL, -- e.g., 'DEPT_HEAD', 'DEAN'
    sort_order INT NOT NULL CHECK (sort_order >= 1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_workflow_sort_order UNIQUE (workflow_id, sort_order)
);

-- 4. WORKFLOW TRANSITIONS TABLE
CREATE TABLE IF NOT EXISTS public.assessment_workflow_transitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID REFERENCES public.assessment_workflow_definitions(id) ON DELETE CASCADE NOT NULL,
    from_status TEXT NOT NULL,
    to_status TEXT NOT NULL,
    rule_condition TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_workflow_transition UNIQUE (workflow_id, from_status, to_status)
);

-- 5. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.assessment_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_workflow_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_workflow_transitions ENABLE ROW LEVEL SECURITY;

-- 6. SECURITY FUNCTIONS (REUSE / ROBUST IF NOT DEFINED)
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

-- 7. RLS POLICIES
-- Configurations
DROP POLICY IF EXISTS "Tenant select config" ON public.assessment_configurations;
CREATE POLICY "Tenant select config" ON public.assessment_configurations
    FOR SELECT TO authenticated USING (school_id = public.get_my_school_id());

DROP POLICY IF EXISTS "Admin manage config" ON public.assessment_configurations;
CREATE POLICY "Admin manage config" ON public.assessment_configurations
    FOR ALL TO authenticated USING (school_id = public.get_my_school_id() AND public.is_admin());

-- Workflow Definitions
DROP POLICY IF EXISTS "Tenant select workflow def" ON public.assessment_workflow_definitions;
CREATE POLICY "Tenant select workflow def" ON public.assessment_workflow_definitions
    FOR SELECT TO authenticated USING (school_id = public.get_my_school_id() AND is_deleted = false);

DROP POLICY IF EXISTS "Admin manage workflow def" ON public.assessment_workflow_definitions;
CREATE POLICY "Admin manage workflow def" ON public.assessment_workflow_definitions
    FOR ALL TO authenticated USING (school_id = public.get_my_school_id() AND public.is_admin());

-- Workflow Steps
DROP POLICY IF EXISTS "Tenant select workflow step" ON public.assessment_workflow_steps;
CREATE POLICY "Tenant select workflow step" ON public.assessment_workflow_steps
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.assessment_workflow_definitions d
            WHERE d.id = public.assessment_workflow_steps.workflow_id
            AND d.school_id = public.get_my_school_id()
            AND d.is_deleted = false
        )
    );

DROP POLICY IF EXISTS "Admin manage workflow step" ON public.assessment_workflow_steps;
CREATE POLICY "Admin manage workflow step" ON public.assessment_workflow_steps
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.assessment_workflow_definitions d
            WHERE d.id = public.assessment_workflow_steps.workflow_id
            AND d.school_id = public.get_my_school_id()
            AND public.is_admin()
        )
    );

-- Workflow Transitions
DROP POLICY IF EXISTS "Tenant select workflow transition" ON public.assessment_workflow_transitions;
CREATE POLICY "Tenant select workflow transition" ON public.assessment_workflow_transitions
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.assessment_workflow_definitions d
            WHERE d.id = public.assessment_workflow_transitions.workflow_id
            AND d.school_id = public.get_my_school_id()
            AND d.is_deleted = false
        )
    );

DROP POLICY IF EXISTS "Admin manage workflow transition" ON public.assessment_workflow_transitions;
CREATE POLICY "Admin manage workflow transition" ON public.assessment_workflow_transitions
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.assessment_workflow_definitions d
            WHERE d.id = public.assessment_workflow_transitions.workflow_id
            AND d.school_id = public.get_my_school_id()
            AND public.is_admin()
        )
    );

-- 8. INDEXES
CREATE INDEX IF NOT EXISTS idx_assessment_config_school ON public.assessment_configurations(school_id);
CREATE INDEX IF NOT EXISTS idx_assessment_workflow_def_school ON public.assessment_workflow_definitions(school_id) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_assessment_workflow_step_wf ON public.assessment_workflow_steps(workflow_id);
CREATE INDEX IF NOT EXISTS idx_assessment_workflow_trans_wf ON public.assessment_workflow_transitions(workflow_id);

-- 9. TRIGGERS
-- Auto-update updated_at timestamp helper function
CREATE OR REPLACE FUNCTION public.fn_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_assessment_config_timestamp ON public.assessment_configurations;
CREATE TRIGGER trg_update_assessment_config_timestamp
    BEFORE UPDATE ON public.assessment_configurations
    FOR EACH ROW EXECUTE FUNCTION public.fn_update_timestamp();

DROP TRIGGER IF EXISTS trg_update_assessment_workflow_def_timestamp ON public.assessment_workflow_definitions;
CREATE TRIGGER trg_update_assessment_workflow_def_timestamp
    BEFORE UPDATE ON public.assessment_workflow_definitions
    FOR EACH ROW EXECUTE FUNCTION public.fn_update_timestamp();

-- 10. SEED CONFIGURATIONS FOR EXISTING SCHOOLS
INSERT INTO public.assessment_configurations (school_id)
SELECT id FROM public.schools
ON CONFLICT (school_id) DO NOTHING;

COMMIT;
