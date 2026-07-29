-- Stage 3.3: Parent portal CRM permissions
BEGIN;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'PARENT'
  AND p.code IN (
    'admission.view_own',
    'admission.create',
    'admission.update',
    'admission.application.view',
    'admission.application.update',
    'admission.application.submit',
    'admission.document.upload',
    'admission.document.view',
    'admission.document.download',
    'admission.document.delete',
    'admission.document.checklist',
    'DASHBOARD_VIEW_PARENT'
  )
ON CONFLICT DO NOTHING;

COMMIT;
