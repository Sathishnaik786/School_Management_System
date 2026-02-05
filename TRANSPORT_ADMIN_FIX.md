# Transport Admin Dashboard - Fix Summary

## Problem
Transport Admin sidebar links were showing but clicking on them resulted in blank pages for:
- `/app/transport/setup`
- `/app/transport/assign`
- `/app/transport/incidents`
- `/app/transport/manifests`

Only these routes were working:
- `/app/transport/overview` (Mission Control)
- `/app/transport/monitor` (Live Trip Monitor)
- `/app/transport/analytics` (Route Analytics)

## Root Cause
The `TRANSPORT_ADMIN` role was missing required permissions in the database. According to the migration files:

**Expected Permissions for TRANSPORT_ADMIN:**
- `TRANSPORT_SETUP` ✅
- `TRANSPORT_ASSIGN` ✅
- `TRANSPORT_VIEW` ✅
- `TRIP_MONITOR` ✅
- `STUDENT_VIEW` ✅

## Fix Applied

### 1. Updated Router Permission (router.tsx)
Changed `/transport/overview` route from `TRANSPORT_SETUP` to `TRIP_MONITOR`:
```tsx
<Route path="transport/overview" element={
    <PermissionGuard permission="TRIP_MONITOR">
        <TransportAdminDashboard />
    </PermissionGuard>
} />
```

### 2. Current Route Permissions
- `/transport/overview` → `TRIP_MONITOR` ✅
- `/transport/setup` → `TRANSPORT_SETUP` ✅
- `/transport/assign` → `TRANSPORT_ASSIGN` ✅
- `/transport/monitor` → `TRIP_MONITOR` ✅
- `/transport/incidents` → `TRANSPORT_SETUP` ✅
- `/transport/manifests` → `TRANSPORT_SETUP` ✅
- `/transport/analytics` → `TRIP_MONITOR` ✅

## Verification Steps

### Step 1: Check Database Permissions
Run this query in Supabase SQL Editor:

```sql
-- Check if transport@school.com has all required permissions
SELECT 
    u.email,
    r.name as role_name,
    p.code as permission_code
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE u.email = 'transport@school.com'
ORDER BY r.name, p.code;
```

Expected output should include:
- TRANSPORT_ADMIN → TRANSPORT_SETUP
- TRANSPORT_ADMIN → TRANSPORT_ASSIGN
- TRANSPORT_ADMIN → TRANSPORT_VIEW
- TRANSPORT_ADMIN → TRIP_MONITOR
- TRANSPORT_ADMIN → STUDENT_VIEW

### Step 2: If Permissions Are Missing
Run the migration file again:
```bash
# Navigate to backend directory
cd backend

# Re-run transport migrations
psql -h <host> -U <user> -d <database> -f database/migrations/025_transport_phase2.sql
psql -h <host> -U <user> -d <database> -f database/migrations/026_transport_phase3.sql
```

### Step 3: Test in Browser
1. Login as `transport@school.com` / `password123`
2. Navigate to each route:
   - http://127.0.0.1:5173/app/transport/setup
   - http://127.0.0.1:5173/app/transport/assign
   - http://127.0.0.1:5173/app/transport/incidents
   - http://127.0.0.1:5173/app/transport/manifests

3. Check browser console for any permission errors

### Step 4: Check Backend Logs
Monitor the backend terminal for RBAC permission check logs:
```
[RBAC] User: transport@school.com, Required: TRANSPORT_SETUP, Has: X perms
```

## Additional Backend Endpoint Added
Added `/api/transport/incidents/recent` endpoint to support the Mission Control dashboard:

```typescript
transportRouter.get('/incidents/recent',
    checkPermission(PERMISSIONS.TRIP_MONITOR),
    async (req, res) => {
        const { data, error } = await supabase
            .from('transport_trip_events')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(5);

        if (error) return res.status(500).json({ error: error.message });
        res.json(data || []);
    }
);
```

## Files Modified
1. `frontend/src/app/router.tsx` - Updated permission guard
2. `frontend/src/layouts/DashboardLayout.tsx` - Enhanced sidebar structure
3. `frontend/src/pages/Dashboard.tsx` - Restored TransportAdminDashboard
4. `frontend/src/modules/transport/pages/TransportSetup.tsx` - Added hash-based navigation
5. `backend/src/modules/transport/transport.routes.ts` - Added incidents endpoint

## Next Steps if Issue Persists
1. Clear browser cache and localStorage
2. Logout and login again
3. Check if user actually has TRANSPORT_ADMIN role assigned
4. Verify Supabase RLS policies are not blocking access
5. Check network tab for 403/401 errors
