-- ============================================================================
-- EDUTRACK ENTERPRISE MIGRATION 133 — DECOMMISSION LEGACY HOSTEL MODULE
-- Governance Baseline: Enterprise Governance Baseline v1.0
-- Target Architecture: Foundation + Core Shared Platform + Admission Subsystem
-- ============================================================================

BEGIN;

-- 1. DROP DEPENDENT VIEWS & TRIGGERS IF EXISTS
DROP VIEW IF EXISTS v_hostel_occupancy CASCADE;

-- 2. DROP LEGACY HOSTEL TABLES
DROP TABLE IF EXISTS hostel_allocations CASCADE;
DROP TABLE IF EXISTS hostel_beds CASCADE;
DROP TABLE IF EXISTS hostel_rooms CASCADE;
DROP TABLE IF EXISTS hostel_buildings CASCADE;
DROP TABLE IF EXISTS hostel_fees CASCADE;

COMMIT;
