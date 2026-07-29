-- ============================================================================
-- EDUTRACK ENTERPRISE MIGRATION 135 — DECOMMISSION LEGACY TIMETABLE MODULE
-- Governance Baseline: Enterprise Governance Baseline v1.0
-- Target Architecture: Foundation + Core Shared Platform + Admission Subsystem
-- ============================================================================

BEGIN;

-- 1. DROP DEPENDENT VIEWS & TRIGGERS IF EXISTS
DROP VIEW IF EXISTS v_timetable_grid CASCADE;

-- 2. DROP LEGACY TIMETABLE TABLES
DROP TABLE IF EXISTS timetable_slots CASCADE;
DROP TABLE IF EXISTS timetable_periods CASCADE;
DROP TABLE IF EXISTS timetable_configs CASCADE;
DROP TABLE IF EXISTS timetables CASCADE;

COMMIT;
