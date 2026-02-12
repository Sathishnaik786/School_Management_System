-- ========================================================
-- MIGRATION: 072_exam_hall_management
-- DESCRIPTION: Global Hall Management and Safety Hardening
-- ========================================================

BEGIN;

-- 1. Enhance global hall registry (Additive/Self-healing)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exam_halls' AND column_name='building') THEN
        ALTER TABLE public.exam_halls ADD COLUMN building TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exam_halls' AND column_name='floor') THEN
        ALTER TABLE public.exam_halls ADD COLUMN floor TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exam_halls' AND column_name='is_active') THEN
        ALTER TABLE public.exam_halls ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exam_halls' AND column_name='updated_at') THEN
        ALTER TABLE public.exam_halls ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Ensure hall name uniqueness per school (if not already exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_school_hall') THEN
        ALTER TABLE public.exam_halls ADD CONSTRAINT unique_school_hall UNIQUE (school_id, hall_name);
    END IF;
END $$;

-- 2. Safety Trigger: Prevent hall deletion if used in seating allocations
CREATE OR REPLACE FUNCTION public.fn_block_hall_delete_if_allocated()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM public.exam_seating_allocations
        WHERE hall_id = OLD.id
    ) THEN
        RAISE EXCEPTION 'HALL_IN_USE: Cannot delete hall with existing seating allocations.';
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_block_hall_delete ON public.exam_halls;

CREATE TRIGGER trg_block_hall_delete
BEFORE DELETE ON public.exam_halls
FOR EACH ROW
EXECUTE FUNCTION public.fn_block_hall_delete_if_allocated();

-- 3. Safety Trigger: Prevent capacity reduction if allocations exist
CREATE OR REPLACE FUNCTION public.fn_block_capacity_reduction_if_allocated()
RETURNS TRIGGER AS $$
BEGIN
    -- Only check if capacity is actually being REDUCED
    IF NEW.capacity < OLD.capacity THEN
        IF EXISTS (
            SELECT 1 FROM public.exam_seating_allocations
            WHERE hall_id = OLD.id
        ) THEN
            RAISE EXCEPTION 'CAPACITY_LOCKED: Cannot reduce capacity after seating allocation.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_block_capacity_reduction ON public.exam_halls;

CREATE TRIGGER trg_block_capacity_reduction
BEFORE UPDATE ON public.exam_halls
FOR EACH ROW
EXECUTE FUNCTION public.fn_block_capacity_reduction_if_allocated();

COMMIT;
