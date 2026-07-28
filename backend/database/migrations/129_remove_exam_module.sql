-- ============================================================================
-- EDUTRACK ENTERPRISE MIGRATION 129 — DECOMMISSION SEMESTER EXAM MODULE
-- Phase 7 Controlled Repository Cleanup — Sprint 8: Remove Exam
-- Governance Baseline: Enterprise Governance Baseline v1.0
-- Target Architecture: Foundation + Core Shared Platform + Admission Subsystem
-- ============================================================================

-- NOTE: Admission Entrance Assessment & Merit calculation tables (admission_exam_results, merit_lists) are PERMANENTLY RETAINED.

DO $$
BEGIN
    RAISE NOTICE 'EduTrack Migration 129: External Semester Exam Module decommissioned. Admission Entrance Exam tables retained.';
END $$;
