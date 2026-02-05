-- ==========================================
-- 020_login_approval_system.sql
-- Implementing login approval workflow for institutional governance
-- ==========================================

-- 1. ENHANCE USERS TABLE
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'login_status') THEN
        ALTER TABLE public.users ADD COLUMN login_status TEXT CHECK (login_status IN ('PENDING', 'APPROVED', 'REJECTED', 'BLOCKED')) DEFAULT 'PENDING';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'login_decision_reason') THEN
        ALTER TABLE public.users ADD COLUMN login_decision_reason TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'login_decided_by') THEN
        ALTER TABLE public.users ADD COLUMN login_decided_by UUID REFERENCES public.users(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'login_decided_at') THEN
        ALTER TABLE public.users ADD COLUMN login_decided_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- 2. ENSURE PERMISSIONS
INSERT INTO public.permissions (code, description)
VALUES 
    ('login.approve', 'Approve parent/student login access'),
    ('login.reject', 'Reject parent/student login access'),
    ('login.read', 'View login approval queue and status')
ON CONFLICT (code) DO NOTHING;

-- 3. ASSIGN PERMISSIONS TO ADMIN
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM public.roles r, public.permissions p
WHERE r.name = 'ADMIN' AND p.code LIKE 'login.%'
ON CONFLICT DO NOTHING;

-- 4. UPDATE get_my_profile RPC TO INCLUDE login_status
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
