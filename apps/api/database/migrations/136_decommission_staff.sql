-- ============================================================================
-- EDUTRACK ENTERPRISE MIGRATION 136 — DECOMMISSION LEGACY STAFF MODULE
-- Governance Baseline: Enterprise Governance Baseline v1.0
-- Target Architecture: Foundation + Core Shared Platform + Admission Subsystem
-- ============================================================================

BEGIN;

-- 1. DROP DEPENDENT VIEWS & TRIGGERS IF EXISTS
DROP VIEW IF EXISTS v_staff_summary CASCADE;

-- 2. DROP LEGACY STAFF TABLES
-- Note: Core Shared Platform Academic tables (faculty_profiles, faculty_section_subjects, section_faculty_assignments) ARE 100% RETAINED.
DROP TABLE IF EXISTS staff_salary CASCADE;
DROP TABLE IF EXISTS staff_leave CASCADE;
DROP TABLE IF EXISTS staff_documents CASCADE;
DROP TABLE IF EXISTS employee_profiles CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS staff_profiles CASCADE;

COMMIT;
