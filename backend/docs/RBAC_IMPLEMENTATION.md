# RBAC Implementation Guide

## Overview
We use a **Role-Based Access Control (RBAC)** system backed by Supabase (PostgreSQL + RLS).
- **Identity**: Supabase Auth (`auth.users`)
- **Authorization**: Database Tables (`roles`, `permissions`, `role_permissions`)
- **Enforcement**: Postgres Row Level Security (RLS)

## 1. Database Architecture
- `roles`: High-level groups (ADMIN, FACULTY). **RLS: Admin Read Only.**
- `permissions`: Granular actions (`student.read`, `exam.publish`). **RLS: Admin Read Only.**
- `user_roles`: Links Users to Roles. **RLS: Users read own, Admin manages.**

## 2. Authentication Flow & Permission Loading
Since the `roles` and `permissions` tables are restricted to ADMIN only, standard users cannot directly query them.
Instead, we use a secure Postgres Function (RPC) to fetch capabilities.

### Backend (SQL)
We have provided `get_user_permissions()` which returns an array of codes.
```sql
-- Returns ["student.read", "exam.create"]
SELECT * FROM get_user_permissions();
```

### Frontend (React + Supabase)
On login, fetch permissions and store them in a React Context/Global Store.

```typescript
// Example Fetch
const { data: permissions } = await supabase.rpc('get_user_permissions');
// permissions = ["student.read", "exam.create"]
```

## 3. Frontend PermissionGate
Use a wrapper component to conditionally render UI.

```tsx
const PermissionGate = ({ permission, children }) => {
  const { userPermissions } = useAuth(); // Your custom hook
  
  if (userPermissions.includes(permission)) {
    return children;
  }
  
  return null; // or <AccessDenied />
};

// Usage
<PermissionGate permission="exam.create">
  <CreateExamButton />
</PermissionGate>
```

## 4. Backend RLS Enforcement
When protecting application data tables (e.g., `students`, `exams`), use the helper function `has_permission()`.

```sql
-- Policy for 'students' table
CREATE POLICY "Faculty can view students" ON students
FOR SELECT
USING ( has_permission('student.read') );
```
This ensures security is enforced at the database level, regardless of the frontend.
