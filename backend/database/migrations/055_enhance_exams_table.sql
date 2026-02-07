-- ==========================================
-- Enhance Exams Table
-- 1. Add Exam Type
-- 2. Add Applicable Classes (Array of UUIDs)
-- ==========================================

DO $$ 
BEGIN
    -- Add type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exams' AND column_name = 'type') THEN
        ALTER TABLE public.exams ADD COLUMN type TEXT;
    END IF;

    -- Add applicable_classes column if it doesn't exist
    -- Using UUID[] (Postgres Array) for storage
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exams' AND column_name = 'applicable_classes') THEN
        ALTER TABLE public.exams ADD COLUMN applicable_classes UUID[];
    END IF;

    -- Add comment for clarity
    COMMENT ON COLUMN public.exams.applicable_classes IS 'List of class_ids this exam applies to. NULL means all classes.';
END $$;
