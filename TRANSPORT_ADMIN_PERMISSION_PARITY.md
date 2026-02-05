# Transport Admin Permission Parity - Complete Guide

## Problem
Transport Admin should have the same transport-related permissions as the Admin role, but some permissions might be missing, causing blank pages when accessing certain routes.

## Required Permissions for Transport Admin

The `TRANSPORT_ADMIN` role should have these permissions (same as ADMIN for transport module):

1. ✅ **TRANSPORT_SETUP** - Create/manage routes, stops, vehicles, drivers
2. ✅ **TRANSPORT_VIEW** - View all transport data
3. ✅ **TRANSPORT_ASSIGN** - Assign students to routes
4. ✅ **TRANSPORT_VIEW_SELF** - View own transport data (for parents)
5. ✅ **TRIP_EXECUTE** - Start/stop trips (for drivers)
6. ✅ **TRIP_VIEW_SELF** - View own trips (for drivers)
7. ✅ **TRIP_MONITOR** - Monitor all live trips
8. ✅ **STUDENT_VIEW** - View student data (needed for assignments)

## Quick Fix - Run in Supabase SQL Editor

### Option 1: Use the SQL File
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Open the file: `FIX_TRANSPORT_ADMIN_PERMISSIONS.sql`
4. Copy all content and paste into SQL Editor
5. Click "Run"

### Option 2: Manual SQL Commands
Copy and paste this into Supabase SQL Editor:

```sql
-- Grant all transport permissions to TRANSPORT_ADMIN
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
```

## Verification

### Step 1: Check Permissions in Database
Run this query to verify:

```sql
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
```

Expected output (8 rows):
```
TRANSPORT_ADMIN | STUDENT_VIEW          | can view students
TRANSPORT_ADMIN | TRANSPORT_ASSIGN      | can assign students to transport
TRANSPORT_ADMIN | TRANSPORT_SETUP       | can setup transport routes and vehicles
TRANSPORT_ADMIN | TRANSPORT_VIEW        | can view transport data
TRANSPORT_ADMIN | TRANSPORT_VIEW_SELF   | can view own transport data
TRANSPORT_ADMIN | TRIP_EXECUTE          | can execute transport trips
TRANSPORT_ADMIN | TRIP_MONITOR          | can monitor all trips
TRANSPORT_ADMIN | TRIP_VIEW_SELF        | can view own trips
```

### Step 2: Check User Permissions
Verify transport@school.com has all permissions:

```sql
SELECT 
    u.email,
    r.name as role_name,
    p.code as permission_code
FROM public.users u
JOIN public.user_roles ur ON u.id = ur.user_id
JOIN public.roles r ON ur.role_id = r.id
JOIN public.role_permissions rp ON r.id = rp.role_id
JOIN public.permissions p ON rp.permission_id = p.id
WHERE u.email = 'transport@school.com'
AND (p.code LIKE 'TRANSPORT%' OR p.code LIKE 'TRIP%' OR p.code = 'STUDENT_VIEW')
ORDER BY p.code;
```

### Step 3: Test in Browser
1. **Logout** from the application
2. **Clear browser cache** (Ctrl+Shift+Delete)
3. **Login** as `transport@school.com` / `password123`
4. **Test each route:**
   - ✅ http://127.0.0.1:5173/app/transport/overview (Mission Control)
   - ✅ http://127.0.0.1:5173/app/transport/monitor (Live Monitor)
   - ✅ http://127.0.0.1:5173/app/transport/analytics (Analytics)
   - ✅ http://127.0.0.1:5173/app/transport/setup (Setup)
   - ✅ http://127.0.0.1:5173/app/transport/assign (Assignments)
   - ✅ http://127.0.0.1:5173/app/transport/incidents (Incidents)
   - ✅ http://127.0.0.1:5173/app/transport/manifests (Manifests)

## Route to Permission Mapping

| Route | Permission Required | Should Work? |
|-------|-------------------|--------------|
| `/transport/overview` | TRIP_MONITOR | ✅ Yes |
| `/transport/setup` | TRANSPORT_SETUP | ✅ Yes |
| `/transport/assign` | TRANSPORT_ASSIGN | ✅ Yes |
| `/transport/monitor` | TRIP_MONITOR | ✅ Yes |
| `/transport/incidents` | TRANSPORT_SETUP | ✅ Yes |
| `/transport/manifests` | TRANSPORT_SETUP | ✅ Yes |
| `/transport/analytics` | TRIP_MONITOR | ✅ Yes |

## Troubleshooting

### If routes still show blank pages:

1. **Check Browser Console**
   - Press F12 to open DevTools
   - Look for permission errors or 403 responses
   - Check Network tab for failed API calls

2. **Check Backend Logs**
   - Look for RBAC permission check logs:
   ```
   [RBAC] User: transport@school.com, Required: TRANSPORT_SETUP, Has: X perms
   ```

3. **Verify User Session**
   - Logout completely
   - Clear localStorage: `localStorage.clear()`
   - Login again

4. **Check RLS Policies**
   - Supabase Row Level Security might be blocking access
   - Verify policies allow TRANSPORT_ADMIN role

5. **Re-run Migrations**
   ```bash
   cd backend
   # Re-run transport migrations
   psql -h <host> -U <user> -d <database> -f database/migrations/025_transport_phase2.sql
   psql -h <host> -U <user> -d <database> -f database/migrations/026_transport_phase3.sql
   psql -h <host> -U <user> -d <database> -f database/migrations/032_transport_admin_parity.sql
   ```

## Files Created/Modified

### New Files:
1. `FIX_TRANSPORT_ADMIN_PERMISSIONS.sql` - SQL script to fix permissions
2. `backend/database/migrations/032_transport_admin_parity.sql` - Migration file
3. `TRANSPORT_ADMIN_PERMISSION_PARITY.md` - This guide

### Modified Files:
1. `frontend/src/app/router.tsx` - Updated permission guards
2. `frontend/src/layouts/DashboardLayout.tsx` - Enhanced sidebar
3. `backend/src/modules/transport/transport.routes.ts` - Added incidents endpoint

## Summary

After running the SQL fix:
- ✅ Transport Admin will have ALL transport permissions
- ✅ All sidebar links will work
- ✅ No more blank pages
- ✅ Full access to transport module features
- ✅ Same capabilities as Admin for transport operations

## Support

If issues persist after following all steps:
1. Check the `TRANSPORT_ADMIN_FIX.md` document
2. Verify database schema is up to date
3. Check Supabase logs for errors
4. Ensure migrations were run in order
