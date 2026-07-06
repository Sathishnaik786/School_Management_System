-- Grant COUNSELOR read access to CRM applications (Applicant360 / AMAT Stage 2)
BEGIN;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r, public.permissions p
WHERE r.name IN ('COUNSELOR', 'COUNSELLOR')
  AND p.code = 'admission.application.view'
ON CONFLICT DO NOTHING;

COMMIT;
