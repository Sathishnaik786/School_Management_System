-- Grant COUNSELOR document upload/view for Applicant360 Stage 3
BEGIN;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r, public.permissions p
WHERE r.name IN ('COUNSELOR', 'COUNSELLOR')
  AND p.code IN ('admission.document.upload', 'admission.document.view', 'admission.document.download')
ON CONFLICT DO NOTHING;

COMMIT;
