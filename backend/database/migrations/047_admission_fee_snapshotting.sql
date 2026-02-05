-- Migration: 047_admission_fee_snapshotting
-- Created: 2026-02-04
-- Purpose: Lay the foundation for a snapshot-safe billing system by creating 
--          the intermediate mapping table and enriching master data.

BEGIN;

-- ==========================================
-- 1. CREATE NEW TABLE: admission_fees
-- ==========================================
CREATE TABLE IF NOT EXISTS public.admission_fees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admission_id UUID NOT NULL REFERENCES public.admissions(id) ON DELETE CASCADE,
    fee_structure_id UUID NOT NULL REFERENCES public.fee_structures(id),
    snapshot_name TEXT NOT NULL,
    snapshot_amount NUMERIC(10,2) NOT NULL,
    snapshot_category TEXT NOT NULL,
    is_mandatory BOOLEAN NOT NULL DEFAULT false,
    payment_status TEXT NOT NULL DEFAULT 'ENABLED',
    enabled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    enabled_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    -- Composite unique constraint to prevent duplicate fee types for one applicant
    UNIQUE(admission_id, fee_structure_id)
);

-- Index for parent/admin lookups
CREATE INDEX IF NOT EXISTS idx_admission_fees_admission_id ON public.admission_fees(admission_id);

-- ==========================================
-- 2. EXTEND Master Table: fee_structures
-- ==========================================
-- Safety: Add columns if they don't exist
ALTER TABLE public.fee_structures 
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS is_mandatory BOOLEAN NOT NULL DEFAULT false;

-- ==========================================
-- 3. DATA BACKFILL (Safe Defaults)
-- ==========================================
-- Categorize existing fees based on naming conventions
UPDATE public.fee_structures
SET category = CASE 
    WHEN (name ILIKE '%admission%' OR fee_details ILIKE '%admission%') THEN 'Admission'
    WHEN (name ILIKE '%tuition%' OR fee_details ILIKE '%tuition%') THEN 'Tuition'
    WHEN (name ILIKE '%transport%' OR fee_details ILIKE '%transport%') THEN 'Transport'
    ELSE 'General'
END
WHERE category IS NULL;

-- Set mandatory flag for core academic fees
UPDATE public.fee_structures
SET is_mandatory = true
WHERE category IN ('Admission', 'Tuition');

-- ==========================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ==========================================
-- Enable RLS
ALTER TABLE public.admission_fees ENABLE ROW LEVEL SECURITY;

-- SELECT POLICY
-- Allowed for Admins, Staff with review permission, and the Parent of the application
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Viewable by staff and owner' AND tablename = 'admission_fees') THEN
        CREATE POLICY "Viewable by staff and owner" ON public.admission_fees
            FOR SELECT TO authenticated
            USING (
                public.is_admin() OR 
                public.has_permission('admission.review') OR
                public.has_permission('FEES_VIEW') OR
                EXISTS (
                    SELECT 1 FROM public.admissions a 
                    WHERE a.id = admission_fees.admission_id 
                    AND a.applicant_user_id = auth.uid()
                )
            );
    END IF;
END $$;

-- INSERT POLICY
-- Restricted to Staff with review permission and Admins
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Manageable by admissions staff' AND tablename = 'admission_fees') THEN
        CREATE POLICY "Manageable by admissions staff" ON public.admission_fees
            FOR INSERT TO authenticated
            WITH CHECK (
                public.is_admin() OR 
                public.has_permission('admission.review')
            );
    END IF;
END $$;

-- DELETE POLICY
-- Allowed only if no payment reference or submitted status exists in the admission dossier
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Deletable before payment' AND tablename = 'admission_fees') THEN
        CREATE POLICY "Deletable before payment" ON public.admission_fees
            FOR DELETE TO authenticated
            USING (
                (public.is_admin() OR public.has_permission('admission.review')) AND
                EXISTS (
                    SELECT 1 FROM public.admissions a 
                    WHERE a.id = admission_fees.admission_id 
                    AND a.status NOT IN ('payment_submitted', 'payment_verified', 'enrolled')
                    AND a.payment_reference IS NULL
                )
            );
    END IF;
END $$;

-- ==========================================
-- 5. IMMUTABILITY TRIGGER
-- ==========================================
-- Since RLS doesn't easily block specific columns during UPDATE, 
-- we use a trigger to ensure snapshots are truly immutable once recorded.
CREATE OR REPLACE FUNCTION public.protect_fee_snapshots()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.snapshot_name <> NEW.snapshot_name OR 
        OLD.snapshot_amount <> NEW.snapshot_amount OR 
        OLD.snapshot_category <> NEW.snapshot_category) THEN
        RAISE EXCEPTION 'Snapshot fields are immutable and cannot be modified.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_protect_admission_fee_snapshots ON public.admission_fees;
CREATE TRIGGER trg_protect_admission_fee_snapshots
BEFORE UPDATE ON public.admission_fees
FOR EACH ROW EXECUTE FUNCTION public.protect_fee_snapshots();

COMMIT;
