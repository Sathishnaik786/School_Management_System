-- Ensure TRANSPORT_ADMIN has all transport permissions that ADMIN has
-- This migration ensures parity between ADMIN and TRANSPORT_ADMIN for transport module

-- Grant all transport-related permissions to TRANSPORT_ADMIN
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM public.roles r, public.permissions p
WHERE r.name = 'TRANSPORT_ADMIN'
AND p.code IN (
    'TRANSPORT_SETUP',
    'TRANSPORT_VIEW',
    'TRANSPORT_ASSIGN',
    'TRANSPORT_VIEW_SELF',
    'TRIP_EXECUTE',
    'TRIP_VIEW_SELF',
    'TRIP_MONITOR',
    'STUDENT_VIEW'
)
ON CONFLICT DO NOTHING;

-- Verify the permissions were granted
DO $$
DECLARE
    perm_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO perm_count
    FROM public.role_permissions rp
    JOIN public.roles r ON rp.role_id = r.id
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE r.name = 'TRANSPORT_ADMIN'
    AND p.code LIKE 'TRANS%' OR p.code LIKE 'TRIP%';
    
    RAISE NOTICE 'TRANSPORT_ADMIN now has % transport-related permissions', perm_count;
END $$;
