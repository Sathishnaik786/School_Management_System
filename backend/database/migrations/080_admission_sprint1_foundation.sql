-- ==================================================
-- 080_admission_sprint1_foundation.sql
-- Phase 3 Sprint 1 Admission Module Foundation
-- ==================================================

BEGIN;

-- 1. EXTENSIBLE FEATURE FLAGS TABLE
CREATE TABLE IF NOT EXISTS public.feature_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module TEXT NOT NULL,
    feature_key TEXT NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT false,
    environment TEXT NOT NULL DEFAULT 'development',
    tenant_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_feature_flag UNIQUE (module, feature_key, environment, tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_feature_flags_lookup ON public.feature_flags (module, feature_key, environment);

-- 2. ERP-WIDE STATUS HISTORY TABLE (Enriched)
CREATE TABLE IF NOT EXISTS public.status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_name TEXT NOT NULL, -- e.g. 'admissions', 'exams'
    entity_id UUID NOT NULL,
    old_status TEXT,
    new_status TEXT NOT NULL,
    changed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    reason TEXT,
    metadata JSONB,
    correlation_id UUID,
    event_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_status_history_lookup ON public.status_history (entity_name, entity_id);
CREATE INDEX IF NOT EXISTS idx_status_history_correlation ON public.status_history (correlation_id);

-- 3. ERP-WIDE RICH AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL, -- e.g. 'INSERT', 'UPDATE', 'DELETE'
    entity_name TEXT NOT NULL,
    entity_id UUID NOT NULL,
    before_state JSONB,
    after_state JSONB,
    ip_address TEXT,
    user_agent TEXT,
    correlation_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs (entity_name, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_correlation ON public.audit_logs (correlation_id);

-- 4. ADMISSION ENQUIRIES TABLE
CREATE TABLE IF NOT EXISTS public.admission_enquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
    student_name TEXT NOT NULL,
    grade_applied_for TEXT NOT NULL,
    parent_name TEXT NOT NULL,
    parent_email TEXT NOT NULL,
    parent_phone TEXT NOT NULL,
    source TEXT NOT NULL CHECK (source IN ('Website', 'Phone', 'Walk-in', 'Campaign', 'Referral')),
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'converted', 'lost')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_enquiries_lookup ON public.admission_enquiries (school_id, academic_year_id, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_enquiries_phone ON public.admission_enquiries (parent_phone) WHERE deleted_at IS NULL;

-- 5. ADMISSION LEADS TABLE
CREATE TABLE IF NOT EXISTS public.admission_leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enquiry_id UUID REFERENCES public.admission_enquiries(id) ON DELETE SET NULL,
    counselor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'warm', 'cold', 'lost', 'converted')),
    lost_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_leads_counselor ON public.admission_leads (counselor_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.admission_leads (status) WHERE deleted_at IS NULL;

-- 6. ADMISSION FOLLOW-UPS TABLE
CREATE TABLE IF NOT EXISTS public.admission_followups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES public.admission_leads(id) ON DELETE CASCADE NOT NULL,
    scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_date TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'missed')),
    notes TEXT,
    created_by UUID REFERENCES public.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_followups_date ON public.admission_followups (scheduled_date, status);
CREATE INDEX IF NOT EXISTS idx_followups_lead ON public.admission_followups (lead_id);

-- 7. ADMISSION VISITORS LOG TABLE
CREATE TABLE IF NOT EXISTS public.admission_visitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    visitor_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    purpose TEXT NOT NULL,
    time_in TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    time_out TIMESTAMP WITH TIME ZONE,
    lead_id UUID REFERENCES public.admission_leads(id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_visitors_lookup ON public.admission_visitors (time_in, visitor_name);
CREATE INDEX IF NOT EXISTS idx_visitors_lead ON public.admission_visitors (lead_id);

-- 8. ADD SOFT DELETE TO EXISTING ADMISSIONS TABLE
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admissions' AND column_name = 'deleted_at') THEN
        ALTER TABLE public.admissions ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_admissions_deleted_at ON public.admissions (deleted_at);

-- 9. SAFE SEEDING OF ROLES & PERMISSIONS
-- Protect existing RBAC settings, insert if not present
INSERT INTO public.roles (name, description)
VALUES 
    ('COUNSELOR', 'Admissions counselor responsible for follow-ups'),
    ('RECEPTIONIST', 'Front-desk receptionist logging walk-in visitors')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.permissions (code, description)
VALUES
    ('admission.enquiry.create', 'Submit prospective candidate enquiries'),
    ('admission.enquiry.view', 'View candidate enquiries log'),
    ('admission.leads.manage', 'Access and update lead follow-ups and pipelines'),
    ('admission.visitors.manage', 'Create and view visitor check-ins'),
    ('admission.status_history.view', 'View status change history log'),
    ('feature_flags.manage', 'View and edit module feature flags')
ON CONFLICT (code) DO NOTHING;

-- Map permissions safely to COUNSELOR
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r, public.permissions p
WHERE r.name = 'COUNSELOR' AND p.code IN ('admission.enquiry.view', 'admission.leads.manage')
ON CONFLICT DO NOTHING;

-- Map permissions safely to RECEPTIONIST
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r, public.permissions p
WHERE r.name = 'RECEPTIONIST' AND p.code IN ('admission.enquiry.create', 'admission.visitors.manage')
ON CONFLICT DO NOTHING;

-- Map permissions safely to ADMIN
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r, public.permissions p
WHERE r.name = 'ADMIN' AND p.code IN (
    'admission.enquiry.create', 'admission.enquiry.view', 'admission.leads.manage', 
    'admission.visitors.manage', 'admission.status_history.view', 'feature_flags.manage'
)
ON CONFLICT DO NOTHING;

-- 10. SEED FEATURE TOGGLES
-- Retrieve first active school ID if exists to set as baseline tenant
DO $$
DECLARE
    v_school_id UUID;
BEGIN
    SELECT id INTO v_school_id FROM public.schools LIMIT 1;
    
    IF v_school_id IS NOT NULL THEN
        -- Seed initial default toggles
        INSERT INTO public.feature_flags (module, feature_key, enabled, environment, tenant_id, description)
        VALUES
            ('admission', 'admission_crm', true, 'development', v_school_id, 'Toggle global admission CRM'),
            ('admission', 'lead_management', false, 'development', v_school_id, 'Toggle detailed counselor pipeline management'),
            ('admission', 'visitor_management', false, 'development', v_school_id, 'Toggle front desk visitor check-ins'),
            ('admission', 'entrance_exam', false, 'development', v_school_id, 'Toggle entrance exam slot scheduling'),
            ('admission', 'merit_engine', false, 'development', v_school_id, 'Toggle grading aggregate merit compilation'),
            ('admission', 'notifications', false, 'development', v_school_id, 'Toggle multi-channel auto-alerts'),
            ('admission', 'reports', false, 'development', v_school_id, 'Toggle CSV/Excel analytical report exports')
        ON CONFLICT ON CONSTRAINT unique_feature_flag DO NOTHING;
    END IF;
END $$;

COMMIT;
