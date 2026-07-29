-- ==================================================
-- 088_workflow_automation_engine.sql
-- Phase 6 Sprint D2: Enterprise Workflow Platform
-- ==================================================

BEGIN;

-- 1. WORKFLOWS DEFINITION
CREATE TABLE IF NOT EXISTS public.workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE, -- e.g. 'ADMISSIONS', 'LEAVE_APPROVAL'
    description TEXT,
    is_template BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. WORKFLOW VERSIONS (Draft, Published, Archived Lifecycle)
CREATE TABLE IF NOT EXISTS public.workflow_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE,
    version INT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    nodes JSONB NOT NULL DEFAULT '[]', -- Visual nodes positions & properties
    connections JSONB NOT NULL DEFAULT '[]', -- Connection edge lines
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_workflow_version UNIQUE (workflow_id, version)
);

-- 3. WORKFLOW VARIABLES & CONTEXT
CREATE TABLE IF NOT EXISTS public.workflow_variables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_version_id UUID REFERENCES public.workflow_versions(id) ON DELETE CASCADE,
    variable_name TEXT NOT NULL,
    variable_type TEXT NOT NULL CHECK (variable_type IN ('string', 'number', 'boolean', 'json')),
    default_value TEXT,
    scope TEXT NOT NULL DEFAULT 'local',
    is_required BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. WORKFLOW STEPS
CREATE TABLE IF NOT EXISTS public.workflow_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version_id UUID REFERENCES public.workflow_versions(id) ON DELETE CASCADE,
    node_id TEXT NOT NULL,
    name TEXT NOT NULL,
    role_required TEXT NOT NULL,
    sequence_order INT NOT NULL,
    sla_warning_hours INT DEFAULT 24,
    sla_escalation_hours INT DEFAULT 48,
    escalation_role TEXT DEFAULT 'PRINCIPAL',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. WORKFLOW CONDITIONS
CREATE TABLE IF NOT EXISTS public.workflow_conditions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version_id UUID REFERENCES public.workflow_versions(id) ON DELETE CASCADE,
    node_id TEXT NOT NULL,
    rules_config JSONB NOT NULL DEFAULT '{}', -- Nested expressions
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. WORKFLOW ACTIONS (Chronological Action Sequencing)
CREATE TABLE IF NOT EXISTS public.workflow_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version_id UUID REFERENCES public.workflow_versions(id) ON DELETE CASCADE,
    node_id TEXT NOT NULL,
    action_type TEXT NOT NULL, -- e.g. 'create_task', 'send_email', 'webhook'
    action_order INT NOT NULL DEFAULT 1,
    action_config JSONB NOT NULL DEFAULT '{}',
    retry_count INT NOT NULL DEFAULT 3,
    retry_interval_secs INT NOT NULL DEFAULT 60,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. WORKFLOW RUN INSTANCES
CREATE TABLE IF NOT EXISTS public.workflow_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version_id UUID REFERENCES public.workflow_versions(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL, -- e.g. 'admission', 'fee', 'leave'
    entity_id UUID NOT NULL,
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    current_node_id TEXT,
    variables_context JSONB NOT NULL DEFAULT '{}', -- Frozen variables context
    status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'waiting', 'escalated', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. AUDIT LOGS / TIMELINES
CREATE TABLE IF NOT EXISTS public.workflow_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_run_id UUID REFERENCES public.workflow_runs(id) ON DELETE CASCADE,
    node_id TEXT,
    action_taken TEXT NOT NULL, -- e.g. 'created', 'assigned', 'approved', 'rejected', 'escalated'
    performed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    remarks TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. DEAD LETTER QUEUE (DLQ)
CREATE TABLE IF NOT EXISTS public.workflow_dlq (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_run_id UUID REFERENCES public.workflow_runs(id) ON DELETE CASCADE,
    node_id TEXT,
    action_type TEXT,
    error_message TEXT,
    payload JSONB,
    retry_attempts INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. APPROVAL REQUESTS REGISTER
CREATE TABLE IF NOT EXISTS public.approval_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_run_id UUID REFERENCES public.workflow_runs(id) ON DELETE CASCADE,
    node_id TEXT NOT NULL,
    assigned_role TEXT NOT NULL,
    assigned_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    decided_at TIMESTAMP WITH TIME ZONE,
    decided_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- 11. STANDALONE BUSINESS RULES ENGINE
CREATE TABLE IF NOT EXISTS public.business_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    event_trigger TEXT NOT NULL,
    rules_config JSONB NOT NULL DEFAULT '{}',
    actions_config JSONB NOT NULL DEFAULT '[]',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. TASK REGISTRY (Priority and Priority check)
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
    assigned_role TEXT,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
    due_at TIMESTAMP WITH TIME ZONE,
    related_entity_type TEXT,
    related_entity_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. TASK COMMENTS (Social and updates logs)
CREATE TABLE IF NOT EXISTS public.task_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. TASK ATTACHMENTS
CREATE TABLE IF NOT EXISTS public.task_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. NOTIFICATION SETUPS
CREATE TABLE IF NOT EXISTS public.workflow_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version_id UUID REFERENCES public.workflow_versions(id) ON DELETE CASCADE,
    node_id TEXT NOT NULL,
    channels TEXT[] NOT NULL, -- e.g. ARRAY['email', 'sms']
    template TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Helper Indexes
CREATE INDEX IF NOT EXISTS idx_workflow_versions_lookup ON public.workflow_versions (workflow_id, status);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_entity ON public.workflow_runs (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_workflow_logs_run ON public.workflow_logs (workflow_run_id);
CREATE INDEX IF NOT EXISTS idx_approval_requests_run ON public.approval_requests (workflow_run_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks (assigned_to, status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_role ON public.tasks (assigned_role, status);

COMMIT;
