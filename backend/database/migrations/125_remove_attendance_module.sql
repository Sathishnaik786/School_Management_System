-- ============================================================================
-- EDUTRACK ENTERPRISE MIGRATION 125 — DECOMMISSION EXTERNAL ATTENDANCE MODULE
-- Phase 7 Controlled Repository Cleanup — Sprint 4: Remove Attendance
-- Governance Baseline: Enterprise Governance Baseline v1.0
-- Target Architecture: Foundation + Core Shared Platform + Admission Subsystem
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'EduTrack Migration 125: External Attendance Module decommissioned.';
END $$;
