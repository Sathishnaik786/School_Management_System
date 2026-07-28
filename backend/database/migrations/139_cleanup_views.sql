-- ============================================================================
-- EDUTRACK ENTERPRISE MIGRATION 139 — CLEANUP DECOMMISSIONED VIEWS
-- Governance Baseline: Enterprise Governance Baseline v1.0
-- Target Architecture: Foundation + Core Shared Platform + Admission Subsystem
-- ============================================================================

BEGIN;

DROP VIEW IF EXISTS v_student_dues CASCADE;
DROP VIEW IF EXISTS v_transport_occupancy CASCADE;
DROP VIEW IF EXISTS v_attendance_summary CASCADE;
DROP VIEW IF EXISTS v_hostel_occupancy CASCADE;
DROP VIEW IF EXISTS v_timetable_grid CASCADE;

COMMIT;
