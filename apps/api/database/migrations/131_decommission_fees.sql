-- ============================================================================
-- EDUTRACK ENTERPRISE MIGRATION 131 — DECOMMISSION LEGACY FEES MODULE
-- Governance Baseline: Enterprise Governance Baseline v1.0
-- Target Architecture: Foundation + Core Shared Platform + Admission Subsystem
-- ============================================================================

BEGIN;

-- 1. DROP DEPENDENT VIEWS & TRIGGERS IF EXISTS
DROP VIEW IF EXISTS v_student_fee_summary CASCADE;
DROP TRIGGER IF EXISTS trg_update_student_ledger ON fee_payments;

-- 2. DROP FOREIGN KEYS & CONSTRAINTS
ALTER TABLE IF EXISTS student_fee_demands DROP CONSTRAINT IF EXISTS fk_student_fee_demands_structure;
ALTER TABLE IF EXISTS student_ledgers DROP CONSTRAINT IF EXISTS fk_student_ledgers_demand;

-- 3. DROP LEGACY ERP FEE TABLES (SAFE CASSCADING DROP)
-- Note: Standalone Admission tables (admission_fee_snapshots, admission_payment_records, admission_fee_waivers) ARE 100% RETAINED.
DROP TABLE IF EXISTS fee_payments CASCADE;
DROP TABLE IF EXISTS student_ledgers CASCADE;
DROP TABLE IF EXISTS student_fee_demands CASCADE;
DROP TABLE IF EXISTS fee_demands CASCADE;
DROP TABLE IF EXISTS fee_components CASCADE;
DROP TABLE IF EXISTS fee_structures CASCADE;
DROP TABLE IF EXISTS finance_settings CASCADE;

COMMIT;
