DO $$
DECLARE
    -- Roles
    r_admin UUID;
    r_counsellor UUID;
    r_parent UUID;

    -- Permissions
    p_apply UUID;
    p_view_self UUID;
    p_review UUID;
    p_approve UUID;
    p_reject UUID;

BEGIN
    -- 1. Create New Permissions
    INSERT INTO public.permissions (code, description) VALUES
    ('ADMISSION_APPLY', 'Apply for admission'),
    ('ADMISSION_VIEW_SELF', 'View own admission applications'),
    ('ADMISSION_APPROVE', 'Approve admission'),
    ('ADMISSION_REJECT', 'Reject admission')
    -- ADMISSION_REVIEW already exists in seed 002, but we ensure it:
    ON CONFLICT (code) DO NOTHING;

    -- 2. Role IDs
    SELECT id INTO r_admin FROM public.roles WHERE name = 'ADMIN';
    SELECT id INTO r_counsellor FROM public.roles WHERE name = 'COUNSELLOR';
    SELECT id INTO r_parent FROM public.roles WHERE name = 'PARENT';

    -- 3. Map Permissions

    -- ADMIN: Gets everything
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT r_admin, id FROM public.permissions 
    WHERE code IN ('ADMISSION_APPLY', 'ADMISSION_VIEW_SELF', 'ADMISSION_REVIEW', 'ADMISSION_APPROVE', 'ADMISSION_REJECT')
    ON CONFLICT DO NOTHING;

    -- COUNSELLOR: Review only
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT r_counsellor, id FROM public.permissions 
    WHERE code = 'ADMISSION_REVIEW'
    ON CONFLICT DO NOTHING;

    -- PARENT (Applicant): Apply, View Self
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT r_parent, id FROM public.permissions 
    WHERE code IN ('ADMISSION_APPLY', 'ADMISSION_VIEW_SELF')
    ON CONFLICT DO NOTHING;
    
    -- NOTE: Ideally 'APPLICANT' role is better, but prompt said map 'Applicant' → which usually maps to a generic user or Parent in this context. 
    -- We'll use PARENT for now as the Applicant role.

END $$;
