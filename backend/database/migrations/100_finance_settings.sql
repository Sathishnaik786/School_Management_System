-- ==================================================
-- 100_finance_settings.sql
-- Phase 2 - Finance Settings & Enhancements
-- ==================================================

BEGIN;

-- ==================================================
-- 1. FINANCE SETTINGS (per-school configuration)
-- ==================================================

CREATE TABLE IF NOT EXISTS public.finance_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL UNIQUE,
    receipt_prefix TEXT NOT NULL DEFAULT 'RCPT',
    demand_prefix TEXT NOT NULL DEFAULT 'DEM',
    currency TEXT NOT NULL DEFAULT 'INR',
    currency_symbol TEXT NOT NULL DEFAULT '₹',
    late_fee_enabled BOOLEAN NOT NULL DEFAULT false,
    late_fee_percentage NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    grace_days INT NOT NULL DEFAULT 0,
    default_payment_window_days INT NOT NULL DEFAULT 30,
    receipt_footer TEXT,
    school_year_label TEXT,
    updated_by UUID REFERENCES public.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================================================
-- 2. ENHANCE fee_demands WITH ADDITIONAL FIELDS
-- ==================================================

ALTER TABLE public.fee_demands
    ADD COLUMN IF NOT EXISTS cancelled_by UUID REFERENCES public.users(id),
    ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS cancel_reason TEXT,
    ADD COLUMN IF NOT EXISTS generated_by UUID REFERENCES public.users(id),
    ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS overdue_at TIMESTAMP WITH TIME ZONE;

-- ==================================================
-- 3. ENHANCE fee_receipts WITH COLLECTED_BY
-- ==================================================

ALTER TABLE public.fee_receipts
    ADD COLUMN IF NOT EXISTS collected_by UUID REFERENCES public.users(id),
    ADD COLUMN IF NOT EXISTS email_sent BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS emailed_at TIMESTAMP WITH TIME ZONE;

-- ==================================================
-- 4. ENHANCE student_fee_ledger WITH DESCRIPTION
-- ==================================================

ALTER TABLE public.student_fee_ledger
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS performed_by UUID REFERENCES public.users(id),
    ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE;

-- ==================================================
-- 5. ENHANCE finance_audit_logs WITH METADATA
-- ==================================================

ALTER TABLE public.finance_audit_logs
    ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS user_name TEXT,
    ADD COLUMN IF NOT EXISTS reference_no TEXT;

-- ==================================================
-- 6. PERFORMANCE INDEXES
-- ==================================================

CREATE INDEX IF NOT EXISTS idx_fee_demands_status ON public.fee_demands(status);
CREATE INDEX IF NOT EXISTS idx_fee_demands_due_date ON public.fee_demands(due_date);
CREATE INDEX IF NOT EXISTS idx_fee_demands_school ON public.fee_demands(school_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created ON public.payment_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON public.payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_mode ON public.payment_transactions(payment_mode);
CREATE INDEX IF NOT EXISTS idx_fee_receipts_receipt_no ON public.fee_receipts(receipt_no);
CREATE INDEX IF NOT EXISTS idx_finance_audit_logs_school ON public.finance_audit_logs(school_id);
CREATE INDEX IF NOT EXISTS idx_finance_audit_logs_created ON public.finance_audit_logs(created_at);

-- ==================================================
-- 7. RLS FOR finance_settings
-- ==================================================

ALTER TABLE public.finance_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Finance settings viewable by finance staff" ON public.finance_settings;
CREATE POLICY "Finance settings viewable by finance staff"
    ON public.finance_settings FOR SELECT
    USING (public.has_finance_read());

DROP POLICY IF EXISTS "Finance settings manageable by admins" ON public.finance_settings;
CREATE POLICY "Finance settings manageable by admins"
    ON public.finance_settings FOR ALL
    USING (public.is_admin());

-- ==================================================
-- 8. MAP CLASS_VIEW & STUDENT_VIEW TO FINANCE STAFF
-- ==================================================
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name IN ('FINANCE_OFFICER', 'ACCOUNTANT')
  AND p.code IN ('CLASS_VIEW', 'STUDENT_VIEW')
ON CONFLICT DO NOTHING;

COMMIT;
