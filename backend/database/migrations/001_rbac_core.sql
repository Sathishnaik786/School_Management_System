-- Enable UUID extension for ID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. TABLES
-- ==========================================

-- ROLES: Defines available roles (ADMIN, FACULTY, etc.)
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PERMISSIONS: Defines granular capabilities (student.read, etc.)
CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ROLE_PERMISSIONS: Maps Roles to Permissions (Many-to-Many)
CREATE TABLE IF NOT EXISTS public.role_permissions (
    role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- USER_ROLES: Assignment of Roles to Users
CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id)
);

-- ==========================================
-- 2. ENABLE RLS
-- ==========================================

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 3. SECURITY FUNCTIONS
-- ==========================================

-- Check if current user is ADMIN
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- SECURITY DEFINER allows this function to bypass RLS on the tables it queries
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if current user has a specific permission code
CREATE OR REPLACE FUNCTION public.has_permission(perm_code TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role_id = rp.role_id
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = auth.uid()
    AND p.code = perm_code
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get all permission codes for the current user
CREATE OR REPLACE FUNCTION public.get_user_permissions()
RETURNS JSONB AS $$
DECLARE
  perms TEXT[];
BEGIN
  SELECT array_agg(DISTINCT p.code)
  INTO perms
  FROM public.user_roles ur
  JOIN public.role_permissions rp ON ur.role_id = rp.role_id
  JOIN public.permissions p ON rp.permission_id = p.id
  WHERE ur.user_id = auth.uid();

  RETURN to_jsonb(coalesce(perms, '{}'::text[]));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 4. RLS POLICIES
-- ==========================================

-- ROLES
-- Only ADMIN can read / No public write
CREATE POLICY "Admin can read roles" ON public.roles
    FOR SELECT TO authenticated
    USING (public.is_admin());

-- PERMISSIONS
-- Only ADMIN can read / No public write
CREATE POLICY "Admin can read permissions" ON public.permissions
    FOR SELECT TO authenticated
    USING (public.is_admin());

-- ROLE_PERMISSIONS
-- Only ADMIN can manage
CREATE POLICY "Admin can manage role_permissions" ON public.role_permissions
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- USER_ROLES
-- User can read their own roles
CREATE POLICY "User can read own roles" ON public.user_roles
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- ADMIN can manage user_roles
CREATE POLICY "Admin can manage user_roles" ON public.user_roles
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());
