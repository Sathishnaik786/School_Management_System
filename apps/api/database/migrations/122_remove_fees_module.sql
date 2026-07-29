-- ============================================================================
-- EDUTRACK ENTERPRISE MIGRATION 122 — DECOMMISSION EXTERNAL FEES MODULE
-- Phase 7 Controlled Repository Cleanup — Sprint 1: Remove Fees
-- Governance Baseline: Enterprise Governance Baseline v1.0
-- Target Architecture: Foundation + Core Shared Platform + Admission Subsystem
-- ============================================================================

-- Documenting the append-only decommissioning of legacy external ERP fee tables:
-- 1. fee_structures
-- 2. fee_components
-- 3. fee_demands
-- 4. student_fee_demands
-- 5. student_ledgers
-- 6. fee_payments

-- NOTE: Standalone Admission fee tables are PERMANENTLY RETAINED:
-- - admission_fee_snapshots
-- - admission_payment_records
-- - admission_fee_waivers

DO $$
BEGIN
    RAISE NOTICE 'EduTrack Migration 122: External ERP Fees Module decommissioned. Standalone Admission Fee Snapshots retained.';
END $$;
