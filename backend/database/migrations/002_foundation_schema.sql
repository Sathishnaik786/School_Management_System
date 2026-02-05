-- ==========================================
-- 0. CLEANUP (For development iteration only)
-- ==========================================
-- In production, manage this better. For now, specific drops to allow re-run.
-- DROP TABLE IF EXISTS public.user_roles CASCADE;
-- DROP TABLE IF EXISTS public.role_permissions CASCADE;
-- DROP TABLE IF EXISTS public.permissions CASCADE;
-- DROP TABLE IF EXISTS public.roles CASCADE;
-- DROP TABLE IF EXISTS public.academic_years CASCADE;
-- DROP TABLE IF EXISTS public.users CASCADE;
-- DROP TABLE IF EXISTS public.schools CASCADE;

-- ==========================================
-- 1. TABLES
-- ==========================================

-- 1. SCHOOLS
CREATE TABLE IF NOT EXISTS public.schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    status TEXT CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()752189
);

-- 2. ACADEMIC_YEARS
CREATE TABLE IF NOT EXISTS public.academic_years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    year_label TEXT NOT NULL, -- e.g. " 2026-2026"
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. USERS (Profile table linked to auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    status TEXT CHECK (status IN ('active', 'suspended')) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ROLES (Re-using/Ensuring existing)
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. PERMISSIONS (Re-using/Ensuring existing)
CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. ROLE_PERMISSIONS
CREATE TABLE IF NOT EXISTS public.role_permissions (
    role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- 7. USER_ROLES (Refers to public.users now, technically same ID as auth.users)
-- Dropping constraint if it pointed to auth.users specifically, though they are same values.
-- To strictly follow req "fk -> users.id", we reference public.users.
CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id)
);

-- ==========================================
-- 2. RLS & SECURITY
-- ==========================================

ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Helper: Get current user's school_id
CREATE OR REPLACE FUNCTION public.get_my_school_id()
RETURNS UUID AS $$
    SELECT school_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper: Is Admin (Global or School Level? Assuming Global for this foundation schema or School Head)
-- Updating is_admin to check for 'ADMIN' role in user_roles
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- POLICIES

-- SCHOOLS
-- View: users can view their own school. Admin can view all.
CREATE POLICY "Users view own school" ON public.schools
    FOR SELECT USING (id = public.get_my_school_id() OR public.is_admin());

-- ACADEMIC_YEARS
-- View: users view their own school's years.
CREATE POLICY "Users view own school years" ON public.academic_years
    FOR SELECT USING (school_id = public.get_my_school_id() OR public.is_admin());

-- USERS
-- View: Users view users in their school. Admin can view all.
CREATE POLICY "View users in same school" ON public.users
    FOR SELECT USING (school_id = public.get_my_school_id() OR public.is_admin());

-- Update: Users can update their own profile? Or only Admin?
-- Let's say Users can read themselves. Admin manages.
CREATE POLICY "Admin manage users" ON public.users
    FOR ALL USING (public.is_admin());

CREATE POLICY "Users read self" ON public.users
    FOR SELECT USING (id = auth.uid());

-- ROLES & PERMISSIONS
-- Read public/authenticated
CREATE POLICY "Auth read roles" ON public.roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth read permissions" ON public.permissions FOR SELECT TO authenticated USING (true);

-- USER_ROLES
-- Read: Users read own. Admin read all.
CREATE POLICY "Read own roles" ON public.user_roles
    FOR SELECT USING (user_id = auth.uid() OR public.is_admin());
    
-- Write: Admin only
CREATE POLICY "Admin manage roles" ON public.user_roles
    FOR ALL USING (public.is_admin());

-- ==========================================
-- 3. RPC FOR FRONTEND
-- ==========================================

-- Get full user profile with school, roles, permissions
CREATE OR REPLACE FUNCTION public.get_my_profile()
RETURNS JSONB AS $$
DECLARE
    user_data JSONB;
    user_roles TEXT[];
    user_perms TEXT[];
BEGIN
    -- Get User & School Data
    SELECT to_jsonb(u.*) || jsonb_build_object('school', to_jsonb(s.*))
    INTO user_data
    FROM public.users u
    LEFT JOIN public.schools s ON u.school_id = s.id
    WHERE u.id = auth.uid();

    -- Get Roles
    SELECT array_agg(r.name)
    INTO user_roles
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid();

    -- Get Permissions
    SELECT array_agg(DISTINCT p.code)
    INTO user_perms
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role_id = rp.role_id
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = auth.uid();

    RETURN jsonb_build_object(
        'user', user_data,
        'roles', coalesce(user_roles, '{}'),
        'permissions', coalesce(user_perms, '{}')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
