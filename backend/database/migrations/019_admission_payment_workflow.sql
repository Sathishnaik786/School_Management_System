-- ==========================================
-- 019_admission_payment_workflow.sql
-- Adding support for detailed admission workflow with documents verification and payments
-- ==========================================

-- 1. UPDATE STATUS CONSTRAINT
ALTER TABLE public.admissions DROP CONSTRAINT IF EXISTS admissions_status_check;
ALTER TABLE public.admissions ADD CONSTRAINT admissions_status_check 
CHECK (status IN ('draft', 'submitted', 'under_review', 'docs_verified', 'payment_pending', 'payment_submitted', 'payment_verified', 'payment_correction', 'recommended', 'approved', 'rejected', 'enrolled'));

-- 2. ADD PAYMENT FIELDS
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admissions' AND column_name = 'payment_enabled') THEN
        ALTER TABLE public.admissions ADD COLUMN payment_enabled BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admissions' AND column_name = 'payment_amount') THEN
        ALTER TABLE public.admissions ADD COLUMN payment_amount DECIMAL(10,2);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admissions' AND column_name = 'payment_mode') THEN
        ALTER TABLE public.admissions ADD COLUMN payment_mode TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admissions' AND column_name = 'payment_reference') THEN
        ALTER TABLE public.admissions ADD COLUMN payment_reference TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admissions' AND column_name = 'payment_proof') THEN
        ALTER TABLE public.admissions ADD COLUMN payment_proof TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admissions' AND column_name = 'payment_date') THEN
        ALTER TABLE public.admissions ADD COLUMN payment_date TIMESTAMP WITH TIME ZONE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admissions' AND column_name = 'payment_verified') THEN
        ALTER TABLE public.admissions ADD COLUMN payment_verified BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admissions' AND column_name = 'remark_by_finance') THEN
        ALTER TABLE public.admissions ADD COLUMN remark_by_finance TEXT;
    END IF;
END $$;
