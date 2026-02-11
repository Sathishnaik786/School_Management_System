
-- Phase-R2 Migration: Academic Year Awareness for Sections
-- Run this in Supabase SQL Editor

-- 1. Add academic_year_id column
ALTER TABLE student_sections 
ADD COLUMN IF NOT EXISTS academic_year_id UUID REFERENCES academic_years(id);

-- 2. Backfill existing rows with the CURRENT ACTIVE Academic Year
-- Logic: Find the year marked as 'active' (is_active = true)
UPDATE student_sections
SET academic_year_id = (
    SELECT id FROM academic_years 
    WHERE is_active = true 
    LIMIT 1
)
WHERE academic_year_id IS NULL;

-- Safety fallback: If no active year, populate with the most recent year created
UPDATE student_sections
SET academic_year_id = (
    SELECT id FROM academic_years 
    ORDER BY created_at DESC 
    LIMIT 1
)
WHERE academic_year_id IS NULL;

-- 3. Add Unique Constraint to prevent duplicates for the same year
-- This ensures a student is in only ONE section per academic year
ALTER TABLE student_sections
ADD CONSTRAINT unique_student_year_section UNIQUE (student_id, academic_year_id);

-- 4. (Optional) Create an index for performance
CREATE INDEX IF NOT EXISTS idx_student_sections_year 
ON student_sections(academic_year_id);
