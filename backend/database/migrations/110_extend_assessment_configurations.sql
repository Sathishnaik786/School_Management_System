-- ==================================================
-- Migration: 110_extend_assessment_configurations.sql
-- Bounded Context: Assessment Platform
-- ==================================================

BEGIN;

ALTER TABLE public.assessment_configurations
ADD COLUMN IF NOT EXISTS settings JSONB NOT NULL DEFAULT '{}'::jsonb;

COMMIT;
