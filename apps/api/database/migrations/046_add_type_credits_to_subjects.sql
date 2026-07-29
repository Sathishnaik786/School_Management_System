-- Migration to add type and credits to subjects table
ALTER TABLE public.subjects 
ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('theory', 'practical')) DEFAULT 'theory',
ADD COLUMN IF NOT EXISTS credits NUMERIC(4,2) DEFAULT 0;
