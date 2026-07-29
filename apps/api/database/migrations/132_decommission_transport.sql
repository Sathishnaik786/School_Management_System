-- ============================================================================
-- EDUTRACK ENTERPRISE MIGRATION 132 — DECOMMISSION LEGACY TRANSPORT MODULE
-- Governance Baseline: Enterprise Governance Baseline v1.0
-- Target Architecture: Foundation + Core Shared Platform + Admission Subsystem
-- ============================================================================

BEGIN;

-- 1. DROP DEPENDENT VIEWS & TRIGGERS IF EXISTS
DROP VIEW IF EXISTS v_transport_occupancy CASCADE;
DROP TRIGGER IF EXISTS trg_update_transport_capacity ON transport_allocations;

-- 2. DROP LEGACY TRANSPORT TABLES
DROP TABLE IF EXISTS transport_attendances CASCADE;
DROP TABLE IF EXISTS transport_schedules CASCADE;
DROP TABLE IF EXISTS transport_allocations CASCADE;
DROP TABLE IF EXISTS transport_stops CASCADE;
DROP TABLE IF EXISTS transport_drivers CASCADE;
DROP TABLE IF EXISTS transport_vehicles CASCADE;
DROP TABLE IF EXISTS transport_routes CASCADE;
DROP TABLE IF EXISTS transport_fees CASCADE;

COMMIT;
