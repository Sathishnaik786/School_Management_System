# 🚨 CRITICAL: Missing Permissions Found!

## Problem Identified
Your Transport Admin only has **4 out of 8** required permissions!

### ✅ You Have (4):
1. ✅ STUDENT_VIEW
2. ✅ TRIP_EXECUTE
3. ✅ TRIP_MONITOR
4. ✅ TRIP_VIEW_SELF

### ❌ You're Missing (3):
1. ❌ **TRANSPORT_SETUP** ← This is why setup page is blank!
2. ❌ **TRANSPORT_VIEW** ← This is why you can't see routes/vehicles!
3. ❌ **TRANSPORT_ASSIGN** ← This is why assignments page is blank!

## 🔧 IMMEDIATE FIX

### Step 1: Run This SQL in Supabase
```sql
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
```

### Step 2: Verify (Should show 7-8 rows)
```sql
SELECT p.code 
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.id
JOIN permissions p ON rp.permission_id = p.id
WHERE r.name = 'TRANSPORT_ADMIN'
AND (p.code LIKE 'TRANSPORT%' OR p.code LIKE 'TRIP%' OR p.code = 'STUDENT_VIEW')
ORDER BY p.code;
```

### Step 3: Logout & Login
1. Logout from the app
2. Clear browser cache (Ctrl+Shift+Delete)
3. Login again as `transport@school.com`

### Step 4: Test Diagnostics Page
Visit: http://127.0.0.1:5173/app/transport/diagnostics

This will show you:
- ✅ Which permissions you have
- ✅ Which API calls work
- ❌ Which ones fail

## Why This Happened
The migration file `025_transport_phase2.sql` should have granted these permissions, but it seems they weren't applied. This SQL fix adds them manually.

## After the Fix
All these routes will work:
- ✅ /app/transport/overview (Mission Control)
- ✅ /app/transport/setup (Routes, Stops, Vehicles, Drivers)
- ✅ /app/transport/assign (Student Assignments)
- ✅ /app/transport/monitor (Live Trips)
- ✅ /app/transport/incidents (Incident Command)
- ✅ /app/transport/manifests (Print Manifests)
- ✅ /app/transport/analytics (Performance Analytics)

## Quick Reference
File with SQL fix: `CRITICAL_FIX_MISSING_PERMISSIONS.sql`
