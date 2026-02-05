-- ==========================================
-- 032_add_parent_details.sql
-- Add separate Mother and Father contact information
-- ==========================================

-- Add Mother Information
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admissions' AND column_name = 'mother_name') THEN
        ALTER TABLE public.admissions ADD COLUMN mother_name TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admissions' AND column_name = 'mother_email') THEN
        ALTER TABLE public.admissions ADD COLUMN mother_email TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admissions' AND column_name = 'mother_phone') THEN
        ALTER TABLE public.admissions ADD COLUMN mother_phone TEXT;
    END IF;

    -- Add Father Information
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admissions' AND column_name = 'father_name') THEN
        ALTER TABLE public.admissions ADD COLUMN father_name TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admissions' AND column_name = 'father_email') THEN
        ALTER TABLE public.admissions ADD COLUMN father_email TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admissions' AND column_name = 'father_phone') THEN
        ALTER TABLE public.admissions ADD COLUMN father_phone TEXT;
    END IF;
END $$;

COMMENT ON COLUMN public.admissions.mother_name IS 'Mother or Guardian name';
COMMENT ON COLUMN public.admissions.mother_email IS 'Mother or Guardian email address';
COMMENT ON COLUMN public.admissions.mother_phone IS 'Mother or Guardian phone number';
COMMENT ON COLUMN public.admissions.father_name IS 'Father or Guardian name';
COMMENT ON COLUMN public.admissions.father_email IS 'Father or Guardian email address';
COMMENT ON COLUMN public.admissions.father_phone IS 'Father or Guardian phone number';
