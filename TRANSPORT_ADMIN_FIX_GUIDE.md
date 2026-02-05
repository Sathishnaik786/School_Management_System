# Transport Admin Portal - Issue Analysis & Fix Guide

## Issue Summary
The Transport Admin portal pages are not displaying output in the dashboard. The menu items are visible in the sidebar, but clicking on them may result in blank pages or permission errors.

## Root Cause Analysis

After reviewing the codebase, I've identified the following:

### ✅ What's Working
1. **All routes are properly defined** in `router.tsx`
2. **All page components exist** and are correctly implemented:
   - TransportAdminDashboard.tsx
   - TransportSetup.tsx
   - StudentTransportAssignment.tsx
   - LiveTripMonitor.tsx
   - IncidentsPage.tsx
   - ManifestPage.tsx
   - TransportAnalytics.tsx
3. **All required components exist**:
   - RouteManager.tsx
   - StopManager.tsx
   - DriverManager.tsx
   - BulkAssignment.tsx
   - TransportFeeManager.tsx
   - ExceptionManager.tsx
   - ManifestViewer.tsx
4. **Sidebar menu is properly configured** with correct paths

### ⚠️ Potential Issues

The most likely causes are:

1. **Missing TRANSPORT_ADMIN Role**
   - User may not have the `TRANSPORT_ADMIN` role assigned
   - Alternative roles: `ADMIN` or `HEAD_OF_INSTITUTE`

2. **Missing Permissions**
   - Required permissions:
     - `TRANSPORT_SETUP` - For setup pages
     - `TRANSPORT_ASSIGN` - For student assignment
     - `TRIP_MONITOR` - For live monitoring and analytics
     - `TRANSPORT_VIEW_SELF` - For personal transport view

3. **Permission Guard Blocking Access**
   - Routes are protected by `PermissionGuard` components
   - If user lacks required permission, they'll see blank pages or be redirected

## How to Diagnose

### Step 1: Access the Debug Page
Navigate to: `http://localhost:5173/app/transport/debug`

This page will show you:
- Current user information
- Assigned roles
- Permission checks
- Route access status
- Troubleshooting recommendations

### Step 2: Check User Roles
Run this SQL query in your database:

```sql
-- Check user roles
SELECT u.email, u.full_name, r.name as role_name
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE u.email = 'your-email@example.com';
```

### Step 3: Check Role Permissions
Run this SQL query to verify role permissions:

```sql
-- Check permissions for TRANSPORT_ADMIN role
SELECT r.name as role_name, p.name as permission_name
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE r.name = 'TRANSPORT_ADMIN'
AND p.name IN ('TRANSPORT_SETUP', 'TRANSPORT_ASSIGN', 'TRIP_MONITOR', 'TRANSPORT_VIEW_SELF');
```

## How to Fix

### Fix 1: Assign TRANSPORT_ADMIN Role

If the user doesn't have the role, run:

```sql
-- Get user ID
SELECT id FROM users WHERE email = 'your-email@example.com';

-- Get TRANSPORT_ADMIN role ID
SELECT id FROM roles WHERE name = 'TRANSPORT_ADMIN';

-- Assign role to user
INSERT INTO user_roles (user_id, role_id, school_id, created_at)
VALUES (
    (SELECT id FROM users WHERE email = 'your-email@example.com'),
    (SELECT id FROM roles WHERE name = 'TRANSPORT_ADMIN'),
    (SELECT id FROM schools LIMIT 1), -- Adjust as needed
    NOW()
);
```

### Fix 2: Create Missing Permissions

If permissions don't exist, create them:

```sql
-- Create transport permissions if they don't exist
INSERT INTO permissions (name, description, created_at)
VALUES 
    ('TRANSPORT_SETUP', 'Manage transport routes, stops, vehicles, and drivers', NOW()),
    ('TRANSPORT_ASSIGN', 'Assign students to transport routes', NOW()),
    ('TRIP_MONITOR', 'Monitor live trips and view analytics', NOW()),
    ('TRANSPORT_VIEW_SELF', 'View own transport details', NOW())
ON CONFLICT (name) DO NOTHING;
```

### Fix 3: Assign Permissions to Role

```sql
-- Assign all transport permissions to TRANSPORT_ADMIN role
INSERT INTO role_permissions (role_id, permission_id, created_at)
SELECT 
    (SELECT id FROM roles WHERE name = 'TRANSPORT_ADMIN'),
    p.id,
    NOW()
FROM permissions p
WHERE p.name IN ('TRANSPORT_SETUP', 'TRANSPORT_ASSIGN', 'TRIP_MONITOR', 'TRANSPORT_VIEW_SELF')
ON CONFLICT DO NOTHING;
```

### Fix 4: Alternative - Use ADMIN Role

If you already have ADMIN role, the transport pages should work because:
- ADMIN role has access to all features
- The sidebar shows transport menu for ADMIN users
- No additional permissions needed

## Page-Specific Access Requirements

| Page | Route | Required Permission |
|------|-------|-------------------|
| Admin Dashboard | `/app/transport/overview` | `TRIP_MONITOR` |
| Transport Setup | `/app/transport/setup` | `TRANSPORT_SETUP` |
| Student Assignment | `/app/transport/assign` | `TRANSPORT_ASSIGN` |
| Live Monitor | `/app/transport/monitor` | `TRIP_MONITOR` |
| Incidents | `/app/transport/incidents` | `TRANSPORT_SETUP` |
| Manifests | `/app/transport/manifests` | `TRANSPORT_SETUP` |
| Analytics | `/app/transport/analytics` | `TRIP_MONITOR` |
| My Transport | `/app/transport/my` | `TRANSPORT_VIEW_SELF` |

## Hash-Based Navigation

The Transport Setup page uses hash-based navigation for different sections:

- `/app/transport/setup#routes` - Manage Routes
- `/app/transport/setup#stops` - Stops & Points
- `/app/transport/setup#vehicles` - Vehicle Fleet
- `/app/transport/setup#drivers` - Driver Registry
- `/app/transport/setup#bulk` - Bulk Assignment
- `/app/transport/setup#fees` - Student Billing
- `/app/transport/setup#exceptions` - Incident Command

These should all work once you have the `TRANSPORT_SETUP` permission.

## Testing Steps

After applying fixes:

1. **Log out and log back in** to refresh the session
2. Navigate to `/app/transport/debug` to verify permissions
3. Try accessing each transport page:
   - `/app/transport/overview` - Should show dashboard with KPIs
   - `/app/transport/setup` - Should show tabs for routes, stops, etc.
   - `/app/transport/assign` - Should show student assignment interface
   - `/app/transport/monitor` - Should show live trip monitor
4. Check browser console for any errors
5. Verify that sidebar menu items are clickable and navigate correctly

## Common Issues & Solutions

### Issue: Blank Page After Clicking Menu Item
**Solution**: Check browser console for permission errors. User likely lacks required permission.

### Issue: Redirected to Unauthorized Page
**Solution**: User doesn't have the required role or permission. Follow Fix 1-3 above.

### Issue: Menu Items Not Visible
**Solution**: User doesn't have TRANSPORT_ADMIN, ADMIN, or HEAD_OF_INSTITUTE role.

### Issue: Tabs Not Working in Transport Setup
**Solution**: This is hash-based navigation. Ensure you're clicking the tabs, not just the sidebar link.

### Issue: API Errors (404, 500)
**Solution**: Backend transport APIs may not be implemented or running. Check backend logs.

## Backend API Requirements

The frontend expects these backend endpoints to exist:

- `GET /transport/routes` - List all routes
- `GET /transport/stops` - List all stops
- `GET /transport/vehicles` - List all vehicles
- `GET /transport/drivers` - List all drivers
- `GET /students` - List all students
- `POST /transport/assign` - Assign student to route
- `POST /transport/assign/bulk` - Bulk assign students
- `GET /transport/trips/live` - Get live trips
- `GET /transport/incidents/recent` - Get recent incidents
- `GET /transport/analytics/punctuality` - Get punctuality analytics

If any of these endpoints are missing, the corresponding pages will show errors or empty states.

## Contact & Support

If issues persist after following this guide:
1. Check the debug page at `/app/transport/debug`
2. Review browser console for errors
3. Check backend logs for API errors
4. Verify database schema matches expected structure

---

**Created**: 2026-02-03
**Last Updated**: 2026-02-03
**Version**: 1.0
