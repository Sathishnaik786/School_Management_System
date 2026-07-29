-- Phase 6: Compliance & Safety Dashboards (Read-Only Views)
-- Description: Aggregated views for Admins to monitor fleet safety status.
-- Non-breaking: PURE SQL VIEWS. No table locks or modifications.

-- ==============================================
-- 1. VIEW: Driver Compliance Status
-- ==============================================

CREATE OR REPLACE VIEW public.view_transport_driver_compliance AS
SELECT 
    tcd.entity_id as driver_id,
    td.user_id,
    u.full_name as driver_name,
    tcd.doc_type,
    tcd.expiry_date,
    tcd.is_verified,
    
    -- Computed Business Logic: Days Remaining
    (tcd.expiry_date - CURRENT_DATE) as days_remaining,
    
    -- Computed Business Logic: Status Flag
    CASE 
        WHEN tcd.expiry_date < CURRENT_DATE THEN 'EXPIRED'
        WHEN (tcd.expiry_date - CURRENT_DATE) <= 30 THEN 'EXPIRING_SOON'
        ELSE 'COMPLIANT'
    END as compliance_status

FROM public.transport_compliance_documents tcd
JOIN public.transport_drivers td ON tcd.entity_id = td.id
JOIN public.users u ON td.user_id = u.id
WHERE tcd.entity_type = 'DRIVER';

-- ==============================================
-- 2. VIEW: Vehicle Compliance Status
-- ==============================================

CREATE OR REPLACE VIEW public.view_transport_vehicle_compliance AS
SELECT 
    tcd.entity_id as vehicle_id,
    tv.vehicle_no,
    tv.capacity,
    tcd.doc_type,
    tcd.expiry_date,
    tcd.is_verified,
    
    -- Computed Logic
    (tcd.expiry_date - CURRENT_DATE) as days_remaining,
    
    CASE 
        WHEN tcd.expiry_date < CURRENT_DATE THEN 'EXPIRED'
        WHEN (tcd.expiry_date - CURRENT_DATE) <= 30 THEN 'EXPIRING_SOON'
        ELSE 'COMPLIANT'
    END as compliance_status

FROM public.transport_compliance_documents tcd
JOIN public.transport_vehicles tv ON tcd.entity_id = tv.id
WHERE tcd.entity_type = 'VEHICLE';

-- ==============================================
-- 3. VIEW: Recent Audit Activity (Last 30 Days)
-- ==============================================

CREATE OR REPLACE VIEW public.view_transport_recent_changes AS
SELECT 
    tal.id,
    tal.entity_type, 
    -- We can't join generic entity_id easily, so we expose it raw
    tal.entity_id,
    tal.action,
    tal.changed_at,
    
    -- Who did it?
    u.full_name as changed_by_name,
    u.email as changed_by_email,
    
    -- Summary of change (Metadata)
    -- If INSERT, show "Created". If DELETE, show "Removed".
    CASE 
        WHEN tal.action = 'INSERT' THEN 'Created Record'
        WHEN tal.action = 'DELETE' THEN 'Deleted Record'
        WHEN tal.action = 'UPDATE' THEN 'Modified Data'
        ELSE tal.action 
    END as activity_summary
    
FROM public.transport_audit_logs tal
LEFT JOIN public.users u ON tal.changed_by = u.id
WHERE tal.changed_at > (NOW() - INTERVAL '30 days')
ORDER BY tal.changed_at DESC;

-- ==============================================
-- 4. SECURITY: Dashboard Access
-- ==============================================

-- Explicit grant to Admin roles (Though Views usually inherit owner rights, RLS on underlying tables applies)
-- Since views are SECURTY INVOKER by default, the user must have access to underlying tables.
-- We already granted RLS on transport_compliance_documents and transport_audit_logs in prev phases.

-- Helper: Just in case, ensuring users can SELECT from these views isn't blocked by generic schema restrictions.
GRANT SELECT ON public.view_transport_driver_compliance TO authenticated;
GRANT SELECT ON public.view_transport_vehicle_compliance TO authenticated;
GRANT SELECT ON public.view_transport_recent_changes TO authenticated;

-- (Actual RLS filtering happens at the Table level: Only Admins can see rows in Audit Logs)
