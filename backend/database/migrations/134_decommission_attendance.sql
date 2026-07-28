-- ============================================================================
-- EDUTRACK ENTERPRISE MIGRATION 134 — DECOMMISSION LEGACY ATTENDANCE MODULE
-- Governance Baseline: Enterprise Governance Baseline v1.0
-- Target Architecture: Foundation + Core Shared Platform + Admission Subsystem
-- ============================================================================

BEGIN;

-- 1. DROP DEPENDENT VIEWS & TRIGGERS IF EXISTS
DROP VIEW IF EXISTS v_attendance_summary CASCADE;
DROP TRIGGER IF EXISTS trg_attendance_audit ON attendance_records;

-- 2. DROP LEGACY ATTENDANCE TABLES
DROP TABLE IF EXISTS attendance_logs CASCADE;
DROP TABLE IF EXISTS attendance_leaves CASCADE;
DROP TABLE IF EXISTS staff_attendance CASCADE;
DROP TABLE IF EXISTS attendance_records CASCADE;
DROP TABLE IF EXISTS attendance_sessions CASCADE;

COMMIT;
