-- ============================================================================
-- EDUTRACK ENTERPRISE MIGRATION 127 — DECOMMISSION STAFF MODULE
-- Phase 7 Controlled Repository Cleanup — Sprint 6: Remove Staff
-- Governance Baseline: Enterprise Governance Baseline v1.0
-- Target Architecture: Foundation + Core Shared Platform + Admission Subsystem
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'EduTrack Migration 127: External Staff Module decommissioned.';
END $$;
