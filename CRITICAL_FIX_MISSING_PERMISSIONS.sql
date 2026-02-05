-- ============================================
-- CRITICAL FIX: Add Missing Transport Permissions
-- You are missing TRANSPORT_SETUP, TRANSPORT_VIEW, TRANSPORT_ASSIGN
-- Run this NOW in Supabase SQL Editor
-- ============================================

-- Add the 3 missing permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM public.roles r, public.permissions p
WHERE r.name = 'TRANSPORT_ADMIN'
AND p.code IN (
    'TRANSPORT_SETUP',
    'TRANSPORT_VIEW',
    'TRANSPORT_ASSIGN'
)
ON CONFLICT DO NOTHING;

-- Verify you now have ALL 8 permissions
SELECT 
    p.code as permission_code,
    p.description
FROM public.role_permissions rp
JOIN public.roles r ON rp.role_id = r.id
JOIN public.permissions p ON rp.permission_id = p.id
WHERE r.name = 'TRANSPORT_ADMIN'
AND (p.code LIKE 'TRANSPORT%' OR p.code LIKE 'TRIP%' OR p.code = 'STUDENT_VIEW')
ORDER BY p.code;

-- Expected output: 8 rows
-- STUDENT_VIEW
-- TRANSPORT_ASSIGN
-- TRANSPORT_SETUP
-- TRANSPORT_VIEW
-- TRANSPORT_VIEW_SELF
-- TRIP_EXECUTE
-- TRIP_MONITOR
-- TRIP_VIEW_SELF
