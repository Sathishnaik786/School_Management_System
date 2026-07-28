-- ============================================================================
-- EDUTRACK ENTERPRISE MIGRATION 138 — RBAC PERMISSION CLEANUP
-- Governance Baseline: Enterprise Governance Baseline v1.0
-- Target Architecture: Foundation + Core Shared Platform + Admission Subsystem
-- ============================================================================

BEGIN;

-- 1. DELETE ROLE_PERMISSIONS FOR DECOMMISSIONED MODULE PERMISSIONS
DELETE FROM role_permissions
WHERE permission_id IN (
    SELECT id FROM permissions 
    WHERE code LIKE 'fee.%'
       OR code LIKE 'transport.%'
       OR code LIKE 'hostel.%'
       OR code LIKE 'attendance.%'
       OR code LIKE 'timetable.%'
       OR code LIKE 'staff.%'
);

-- 2. DELETE DECOMMISSIONED PERMISSIONS
DELETE FROM permissions
WHERE code LIKE 'fee.%'
   OR code LIKE 'transport.%'
   OR code LIKE 'hostel.%'
   OR code LIKE 'attendance.%'
   OR code LIKE 'timetable.%'
   OR code LIKE 'staff.%';

COMMIT;
