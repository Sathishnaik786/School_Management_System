-- ============================================================================
-- EDUTRACK ENTERPRISE MIGRATION 137 — DECOMMISSION LEGACY STUDENT SIS MODULE
-- Governance Baseline: Enterprise Governance Baseline v1.0
-- Target Architecture: Foundation + Core Shared Platform + Admission Subsystem
-- ============================================================================

BEGIN;

-- 1. DROP DEPENDENT VIEWS & TRIGGERS IF EXISTS
DROP VIEW IF EXISTS v_student_summary CASCADE;

-- 2. DROP LEGACY STUDENT TABLES
DROP TABLE IF EXISTS student_history CASCADE;
DROP TABLE IF EXISTS student_promotions CASCADE;
DROP TABLE IF EXISTS student_roll_numbers CASCADE;
DROP TABLE IF EXISTS student_status CASCADE;
DROP TABLE IF EXISTS student_medical CASCADE;
DROP TABLE IF EXISTS student_documents CASCADE;
DROP TABLE IF EXISTS student_contacts CASCADE;
DROP TABLE IF EXISTS student_guardians CASCADE;
DROP TABLE IF EXISTS student_profiles CASCADE;

-- Note: 'students' table soft-decommissioned (retained for optional dev student candidate provisioning in Standalone Admission)

COMMIT;
