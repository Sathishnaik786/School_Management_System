-- ============================================================================
-- EDUTRACK ENTERPRISE MIGRATION 128 — DECOMMISSION STUDENT SIS MODULE
-- Phase 7 Controlled Repository Cleanup — Sprint 7: Remove Student SIS
-- Governance Baseline: Enterprise Governance Baseline v1.0
-- Target Architecture: Foundation + Core Shared Platform + Admission Subsystem
-- ============================================================================

-- NOTE: Standalone Admission student candidate provisioning uses ENABLE_ERP_STUDENT_PROVISIONING feature toggle.

DO $$
BEGIN
    RAISE NOTICE 'EduTrack Migration 128: Student SIS Module decommissioned. Admission student candidate records retained.';
END $$;
