-- Migration: 108_exams_status_check_published
-- Description: Update exams table status check constraint to allow 'PUBLISHED' status value.

BEGIN;

ALTER TABLE public.exams DROP CONSTRAINT IF EXISTS exams_status_check;

ALTER TABLE public.exams ADD CONSTRAINT exams_status_check CHECK (status IN ('DRAFT', 'ACTIVE', 'PUBLISHED', 'COMPLETED', 'CANCELLED'));

COMMIT;
