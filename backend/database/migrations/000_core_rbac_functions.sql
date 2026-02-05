-- Core RBAC Functions cleanup and re-creation
-- This fixed the "cannot change name of input parameter" error

-- 1. Drop existing versions to ensure parameter name consistency
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.has_permission(text) CASCADE;
DROP FUNCTION IF EXISTS public.get_my_school_id() CASCADE;
DROP FUNCTION IF EXISTS public.can_manage_transport() CASCADE;

-- 2. Create is_admin()
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid()
        AND r.name = 'ADMIN'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create has_permission(p_code)
CREATE OR REPLACE FUNCTION public.has_permission(p_code TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.role_permissions rp ON ur.role_id = rp.role_id
        JOIN public.permissions p ON rp.permission_id = p.id
        WHERE ur.user_id = auth.uid()
        AND p.code = p_code
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create get_my_school_id()
CREATE OR REPLACE FUNCTION public.get_my_school_id()
RETURNS UUID AS $$
BEGIN
    RETURN (SELECT school_id FROM public.users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create can_manage_transport()
CREATE OR REPLACE FUNCTION public.can_manage_transport()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN public.is_admin() OR public.has_permission('TRANSPORT_SETUP');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
