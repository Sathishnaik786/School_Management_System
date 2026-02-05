-- Transport Admin Setup Script
-- Run this script to set up transport admin permissions and roles

-- ============================================
-- 1. Create Transport Permissions (if not exist)
-- ============================================

INSERT INTO permissions (name, description, created_at)
VALUES 
    ('TRANSPORT_SETUP', 'Manage transport routes, stops, vehicles, and drivers', NOW()),
    ('TRANSPORT_ASSIGN', 'Assign students to transport routes', NOW()),
    ('TRIP_MONITOR', 'Monitor live trips and view analytics', NOW()),
    ('TRANSPORT_VIEW_SELF', 'View own transport details', NOW())
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 2. Create TRANSPORT_ADMIN Role (if not exist)
-- ============================================

INSERT INTO roles (name, description, created_at)
VALUES ('TRANSPORT_ADMIN', 'Transport Administrator - Full access to transport module', NOW())
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 3. Assign Permissions to TRANSPORT_ADMIN Role
-- ============================================

INSERT INTO role_permissions (role_id, permission_id, created_at)
SELECT 
    (SELECT id FROM roles WHERE name = 'TRANSPORT_ADMIN'),
    p.id,
    NOW()
FROM permissions p
WHERE p.name IN (
    'TRANSPORT_SETUP',
    'TRANSPORT_ASSIGN',
    'TRIP_MONITOR',
    'TRANSPORT_VIEW_SELF'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ============================================
-- 4. Assign TRANSPORT_ADMIN Role to User
-- ============================================

-- REPLACE 'your-email@example.com' with the actual user email
-- REPLACE school_id value as needed

DO $$
DECLARE
    v_user_id UUID;
    v_role_id UUID;
    v_school_id UUID;
BEGIN
    -- Get user ID (CHANGE THIS EMAIL)
    SELECT id INTO v_user_id FROM users WHERE email = 'your-email@example.com';
    
    -- Get role ID
    SELECT id INTO v_role_id FROM roles WHERE name = 'TRANSPORT_ADMIN';
    
    -- Get first school ID (or specify your school)
    SELECT id INTO v_school_id FROM schools LIMIT 1;
    
    -- Check if user exists
    IF v_user_id IS NULL THEN
        RAISE NOTICE 'User not found! Please update the email in the script.';
    ELSE
        -- Assign role to user
        INSERT INTO user_roles (user_id, role_id, school_id, created_at)
        VALUES (v_user_id, v_role_id, v_school_id, NOW())
        ON CONFLICT (user_id, role_id, school_id) DO NOTHING;
        
        RAISE NOTICE 'TRANSPORT_ADMIN role assigned successfully to user: %', v_user_id;
    END IF;
END $$;

-- ============================================
-- 5. Verify Setup
-- ============================================

-- Check user roles
SELECT 
    u.email,
    u.full_name,
    r.name as role_name,
    s.name as school_name
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
LEFT JOIN schools s ON ur.school_id = s.id
WHERE u.email = 'your-email@example.com';  -- CHANGE THIS EMAIL

-- Check role permissions
SELECT 
    r.name as role_name,
    p.name as permission_name,
    p.description
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE r.name = 'TRANSPORT_ADMIN'
ORDER BY p.name;

-- ============================================
-- ALTERNATIVE: Assign to Existing ADMIN User
-- ============================================

-- If you already have an ADMIN user, you can also assign transport
-- permissions to the ADMIN role instead:

/*
INSERT INTO role_permissions (role_id, permission_id, created_at)
SELECT 
    (SELECT id FROM roles WHERE name = 'ADMIN'),
    p.id,
    NOW()
FROM permissions p
WHERE p.name IN (
    'TRANSPORT_SETUP',
    'TRANSPORT_ASSIGN',
    'TRIP_MONITOR',
    'TRANSPORT_VIEW_SELF'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;
*/

-- ============================================
-- CLEANUP (Use with caution!)
-- ============================================

-- Uncomment to remove transport admin role from a user
/*
DELETE FROM user_roles 
WHERE user_id = (SELECT id FROM users WHERE email = 'your-email@example.com')
AND role_id = (SELECT id FROM roles WHERE name = 'TRANSPORT_ADMIN');
*/

-- ============================================
-- NOTES
-- ============================================

-- After running this script:
-- 1. Log out and log back in to refresh the session
-- 2. Navigate to /app/transport/debug to verify permissions
-- 3. Try accessing transport pages
-- 4. Check browser console for any errors

-- If issues persist:
-- - Verify the user email is correct
-- - Check that schools table has at least one entry
-- - Ensure the backend is running and connected to the database
-- - Review the TRANSPORT_ADMIN_FIX_GUIDE.md for more details
