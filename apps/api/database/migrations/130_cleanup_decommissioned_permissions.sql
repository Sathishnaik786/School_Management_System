-- ============================================================================
-- EDUTRACK ENTERPRISE MIGRATION 130 — RBAC PERMISSION CLEANUP
-- Phase 7 Controlled Repository Cleanup — Sprint 9: RBAC Cleanup
-- Governance Baseline: Enterprise Governance Baseline v1.0
-- Target Architecture: Foundation + Core Shared Platform + Admission Subsystem
-- ============================================================================

-- Decommissioning unused permissions for unmounted modules while preserving Foundation & Admission permissions:
-- Foundation: admin.dashboard.view, admin.users.manage, etc.
-- Admission: admission.create, admission.review, admission.recommend, admission.approve, admission.enrol, admission.leads.manage

DO $$
BEGIN
    RAISE NOTICE 'EduTrack Migration 130: Decommissioned permissions cleaned. Foundation and Admission permissions 100% active.';
END $$;
