-- Stage 3.3: Parent portal fee/enrollment view permissions
BEGIN;

INSERT INTO public.permissions (code, description)
VALUES
    ('admission.fees.view', 'View admission fee summary for own application'),
    ('admission.enrollment.view', 'View enrollment status for own application')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'PARENT'
  AND p.code IN (
    'admission.fees.view',
    'admission.enrollment.view'
  )
ON CONFLICT DO NOTHING;

COMMIT;
