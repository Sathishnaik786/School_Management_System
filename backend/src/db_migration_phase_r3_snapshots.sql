
-- Phase-R3 Migration: Snapshots for Historical Data
-- Run this in Supabase SQL Editor

-- 1. Add snapshot columns to student_result_summaries
-- These persist the student's context AT THE TIME of result processing
ALTER TABLE student_result_summaries
ADD COLUMN IF NOT EXISTS class_name_snapshot TEXT,
ADD COLUMN IF NOT EXISTS section_name_snapshot TEXT,
ADD COLUMN IF NOT EXISTS academic_year_label_snapshot TEXT;

-- 2. Populate for existing rows (Best Effort)
-- We join back to current student_sections using the exam's year.
-- This cleans up past data using our Phase-R2 logic.

UPDATE student_result_summaries srs
SET 
  class_name_snapshot = cl.name,
  section_name_snapshot = sec.name,
  academic_year_label_snapshot = ay.year_label
FROM 
  exams e,
  academic_years ay,
  student_sections ss,
  sections sec,
  classes cl
WHERE 
  srs.exam_id = e.id
  AND e.academic_year_id = ay.id
  AND ss.student_id = srs.student_id
  AND ss.academic_year_id = e.academic_year_id -- The magic link from Phase-R2
  AND ss.section_id = sec.id
  AND sec.class_id = cl.id
  AND srs.class_name_snapshot IS NULL; -- Only update missing ones
