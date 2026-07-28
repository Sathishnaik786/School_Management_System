-- ============================================================================
-- EDUTRACK ENTERPRISE MIGRATION 123 — DECOMMISSION EXTERNAL TRANSPORT MODULE
-- Phase 7 Controlled Repository Cleanup — Sprint 2: Remove Transport
-- Governance Baseline: Enterprise Governance Baseline v1.0
-- Target Architecture: Foundation + Core Shared Platform + Admission Subsystem
-- ============================================================================

-- Documenting the append-only decommissioning of legacy external ERP transport tables:
-- 1. transport_routes
-- 2. transport_stops
-- 3. transport_vehicles
-- 4. transport_drivers
-- 5. student_transport_allocation
-- 6. transport_incidents

-- NOTE: Admission optional transport hook in TransportProvisioner.ts is stubbed safely.

DO $$
BEGIN
    RAISE NOTICE 'EduTrack Migration 123: External ERP Transport Module decommissioned. Admission transport hook stubbed.';
END $$;
