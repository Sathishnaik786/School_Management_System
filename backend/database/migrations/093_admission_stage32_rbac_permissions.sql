-- Stage 3.2 RBAC: evaluation, finance, and counselor submit permissions
BEGIN;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name IN ('EXAM_CELL', 'EXAM_CELL_ADMIN')
  AND p.code IN (
    'admission.exam.manage',
    'admission.exam.evaluate',
    'admission.interview.manage',
    'admission.interview.evaluate',
    'admission.application.view'
  )
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name IN ('FINANCE_OFFICER', 'ACCOUNTANT')
  AND p.code IN ('admission.fees.manage', 'admission.payments.record', 'admission.application.view')
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name IN ('COUNSELOR', 'COUNSELLOR')
  AND p.code = 'admission.application.submit'
ON CONFLICT DO NOTHING;

COMMIT;
