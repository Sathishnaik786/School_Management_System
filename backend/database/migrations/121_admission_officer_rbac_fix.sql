-- Migration 121: Map missing permissions to ADMISSION_OFFICER role
BEGIN;

-- Map permissions safely to ADMISSION_OFFICER
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'ADMISSION_OFFICER'
  AND p.code IN (
    'admission.approve',
    'admission.document.verify',
    'admission.exam.manage',
    'admission.exam.evaluate',
    'admission.interview.manage',
    'admission.interview.evaluate',
    'admission.merit.generate',
    'admission.offer.manage',
    'admission.application.view'
  )
ON CONFLICT DO NOTHING;

COMMIT;
