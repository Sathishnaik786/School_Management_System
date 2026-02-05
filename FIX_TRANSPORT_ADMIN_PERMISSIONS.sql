-- ============================================
-- TRANSPORT ADMIN PERMISSION PARITY FIX
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Grant all transport permissions to TRANSPORT_ADMIN
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

-- Step 2: Verify permissions were granted
SELECT 
    r.name as role_name,
    p.code as permission_code,
    p.description
FROM public.role_permissions rp
JOIN public.roles r ON rp.role_id = r.id
JOIN public.permissions p ON rp.permission_id = p.id
WHERE r.name = 'TRANSPORT_ADMIN'
AND (p.code LIKE 'TRANSPORT%' OR p.code LIKE 'TRIP%' OR p.code = 'STUDENT_VIEW')
ORDER BY p.code;

-- Step 3: Verify transport@school.com user has TRANSPORT_ADMIN role
SELECT 
    u.email,
    r.name as role_name
FROM public.users u
JOIN public.user_roles ur ON u.id = ur.user_id
JOIN public.roles r ON ur.role_id = r.id
WHERE u.email = 'transport@school.com';

-- Step 4: Show all permissions for transport@school.com
SELECT 
    u.email,
    r.name as role_name,
    p.code as permission_code,
    p.description
FROM public.users u
JOIN public.user_roles ur ON u.id = ur.user_id
JOIN public.roles r ON ur.role_id = r.id
JOIN public.role_permissions rp ON r.id = rp.role_id
JOIN public.permissions p ON rp.permission_id = p.id
WHERE u.email = 'transport@school.com'
AND (p.code LIKE 'TRANSPORT%' OR p.code LIKE 'TRIP%' OR p.code = 'STUDENT_VIEW')
ORDER BY r.name, p.code;
