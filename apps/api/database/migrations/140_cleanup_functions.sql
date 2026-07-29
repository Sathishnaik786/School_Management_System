-- ============================================================================
-- EDUTRACK ENTERPRISE MIGRATION 140 — CLEANUP UNREFERENCED STORED FUNCTIONS
-- Governance Baseline: Enterprise Governance Baseline v1.0
-- Target Architecture: Foundation + Core Shared Platform + Admission Subsystem
-- ============================================================================

BEGIN;

DROP FUNCTION IF EXISTS fn_calculate_late_fee CASCADE;
DROP FUNCTION IF EXISTS fn_generate_timetable CASCADE;
DROP FUNCTION IF EXISTS fn_sync_transport_attendance CASCADE;

COMMIT;
