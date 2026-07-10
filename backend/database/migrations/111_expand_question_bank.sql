-- ==================================================
-- Migration: 111_expand_question_bank.sql
-- Bounded Context: Assessment Platform — Question Engine
-- ==================================================

BEGIN;

-- Drop check constraint on question_type to support extensible formatting
ALTER TABLE public.assessment_question_bank
DROP CONSTRAINT IF EXISTS assessment_question_bank_question_type_check;

-- Add parent_id index for version history timeline
CREATE INDEX IF NOT EXISTS idx_assessment_q_bank_parent ON public.assessment_question_bank(parent_id);

-- Alter check constraint on status if it exists, or drop and recreate to ensure it has all values
ALTER TABLE public.assessment_question_bank
DROP CONSTRAINT IF EXISTS assessment_question_bank_status_check;

ALTER TABLE public.assessment_question_bank
ADD CONSTRAINT assessment_question_bank_status_check
CHECK (status IN ('DRAFT', 'UNDER_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED'));

COMMIT;
