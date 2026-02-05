# Quick Fix: Transport Admin Portal Not Showing Pages

## Problem
Transport Admin menu items are visible but pages are blank or not loading.

## Quick Solution (3 Steps)

### Step 1: Check Your Access
Visit: **http://localhost:5173/app/transport/debug**

This will show you:
- ✅ Your current roles
- ✅ Your permissions
- ✅ Which pages you can access
- ❌ What's missing

### Step 2: Run the Setup Script

**Option A: Using psql**
```bash
cd backend/scripts
psql -U your_username -d your_database -f setup_transport_admin.sql
```

**Option B: Using Database Client**
1. Open your database client (pgAdmin, DBeaver, etc.)
2. Open `backend/scripts/setup_transport_admin.sql`
3. **IMPORTANT**: Replace `'your-email@example.com'` with your actual email (appears 3 times in the file)
4. Run the script

### Step 3: Refresh Your Session
1. Log out of the application
2. Log back in
3. Navigate to `/app/transport/overview`
4. Pages should now load correctly

## What the Script Does

1. ✅ Creates transport permissions (if missing)
2. ✅ Creates TRANSPORT_ADMIN role (if missing)
3. ✅ Assigns permissions to the role
4. ✅ Assigns the role to your user
5. ✅ Verifies everything is set up correctly

## Verification

After running the script, you should see:

**In the debug page** (`/app/transport/debug`):
- ✅ TRANSPORT_ADMIN role (green checkmark)
- ✅ All transport permissions (green checkmarks)
- ✅ All route access (green checkmarks)

**In the sidebar**:
- 1. HQ Mission Control
- 2. Infrastructure & Fleet
- 3. Operational Logistics
- 4. System Diagnostics

**All these pages should work**:
- `/app/transport/overview` - Dashboard
- `/app/transport/setup` - Setup with tabs
- `/app/transport/assign` - Student assignment
- `/app/transport/monitor` - Live monitoring
- `/app/transport/incidents` - Incident management
- `/app/transport/manifests` - Print manifests
- `/app/transport/analytics` - Analytics

## Still Not Working?

### Check 1: Backend Running?
```bash
# In backend directory
npm run dev
```

### Check 2: Database Connected?
Check backend console for database connection errors

### Check 3: API Endpoints Exist?
Open browser console (F12) and check for 404 errors when clicking pages

### Check 4: User Email Correct?
Run this in your database:
```sql
SELECT email, full_name FROM users WHERE email LIKE '%your-partial-email%';
```

## Alternative: Use ADMIN Role

If you already have ADMIN role, you can skip the script and just add transport permissions to ADMIN:

```sql
INSERT INTO role_permissions (role_id, permission_id, created_at)
SELECT 
    (SELECT id FROM roles WHERE name = 'ADMIN'),
    p.id,
    NOW()
FROM permissions p
WHERE p.name IN ('TRANSPORT_SETUP', 'TRANSPORT_ASSIGN', 'TRIP_MONITOR')
ON CONFLICT DO NOTHING;
```

Then log out and log back in.

## Need More Help?

See the detailed guide: `TRANSPORT_ADMIN_FIX_GUIDE.md`

---

**Last Updated**: 2026-02-03
