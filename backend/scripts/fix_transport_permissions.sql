-- Fix Transport Admin Permissions
-- This script adds the missing TRANSPORT_SETUP and TRANSPORT_ASSIGN permissions

-- Step 1: Ensure the permissions exist in the database
INSERT INTO permissions (code, description, created_at)
VALUES 
    ('TRANSPORT_SETUP', 'Manage transport routes, stops, vehicles, and drivers', NOW()),
    ('TRANSPORT_ASSIGN', 'Assign students to transport routes', NOW()),
    ('TRANSPORT_VIEW_SELF', 'View own transport details', NOW())
ON CONFLICT (code) DO NOTHING;

-- Step 2: Assign the missing permissions to TRANSPORT_ADMIN role
INSERT INTO role_permissions (role_id, permission_id, created_at)
SELECT 
    (SELECT id FROM roles WHERE name = 'TRANSPORT_ADMIN'),
    p.id,
    NOW()
FROM permissions p
WHERE p.code IN ('TRANSPORT_SETUP', 'TRANSPORT_ASSIGN', 'TRANSPORT_VIEW_SELF')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Step 3: Verify the permissions
SELECT 
    r.name as role_name,
    p.code as permission_code,
    p.description
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE r.name = 'TRANSPORT_ADMIN'
ORDER BY p.code;
