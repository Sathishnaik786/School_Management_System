-- ==================================================
-- 081_admission_sprint2_crm_fields.sql
-- Phase 3 Sprint 2 CRM Fields & Request Tracking
-- ==================================================

BEGIN;

-- 1. ADD CRM FIELDS TO ADMISSION ENQUIRIES
ALTER TABLE public.admission_enquiries ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE public.admission_enquiries ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.admission_enquiries ADD COLUMN IF NOT EXISTS current_school TEXT;
ALTER TABLE public.admission_enquiries ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.admission_enquiries ADD COLUMN IF NOT EXISTS remarks TEXT;

-- 2. ALTER STATUS CHECK CONSTRAINTS ON LEADS (Restricted to CRM only, uppercase)
ALTER TABLE public.admission_leads DROP CONSTRAINT IF EXISTS admission_leads_status_check;
ALTER TABLE public.admission_leads ALTER COLUMN status SET DEFAULT 'NEW';
ALTER TABLE public.admission_leads ADD CONSTRAINT admission_leads_status_check CHECK (
    status IN ('NEW', 'CONTACTED', 'FOLLOW_UP', 'VISITED', 'INTERESTED', 'NOT_INTERESTED', 'LOST')
);

-- 3. ALTER STATUS CHECK CONSTRAINTS ON FOLLOWUPS (Add cancelled status)
ALTER TABLE public.admission_followups DROP CONSTRAINT IF EXISTS admission_followups_status_check;
ALTER TABLE public.admission_followups ADD CONSTRAINT admission_followups_status_check CHECK (
    status IN ('scheduled', 'completed', 'missed', 'cancelled')
);

-- 4. ADD VISITOR REGISTER EXTENSIONS (counselor mapping, remarks, visit type, outcome)
ALTER TABLE public.admission_visitors ADD COLUMN IF NOT EXISTS counselor_id UUID REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.admission_visitors ADD COLUMN IF NOT EXISTS remarks TEXT;
ALTER TABLE public.admission_visitors ADD COLUMN IF NOT EXISTS visit_type TEXT CHECK (
    visit_type IN ('Walk-in', 'Campus Tour', 'Meeting', 'Admission Inquiry', 'Parent Meeting')
);
ALTER TABLE public.admission_visitors ADD COLUMN IF NOT EXISTS visit_outcome TEXT;

-- 5. REUSABLE ERP-WIDE REQUEST TRACKING (IDEMPOTENCY) TABLE
CREATE TABLE IF NOT EXISTS public.request_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID,
    idempotency_key TEXT UNIQUE,
    module TEXT NOT NULL,
    operation TEXT NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    request_hash TEXT,
    status TEXT NOT NULL, -- 'RECEIVED', 'PROCESSING', 'COMPLETED', 'FAILED'
    response_code INT NOT NULL,
    response_body JSONB NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_request_tracking_key ON public.request_tracking (idempotency_key);

-- 6. GENERIC PL/PGSQL TRANSACTION EXECUTOR FUNCTION
CREATE OR REPLACE FUNCTION public.exec_transaction_queries(sql_queries TEXT[])
RETURNS TEXT[] AS $$
DECLARE
    q TEXT;
    results TEXT[] := '{}';
BEGIN
    FOREACH q IN ARRAY sql_queries
    LOOP
        EXECUTE q;
        results := array_append(results, 'SUCCESS');
    END LOOP;
    RETURN results;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
