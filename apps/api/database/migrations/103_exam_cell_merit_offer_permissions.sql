-- Migration: Grant EXAM_CELL merit and offer permissions
-- These permissions are required to access /app/admissions/merit and /app/admissions/offers pages.
-- EXAM_CELL / EXAM_CELL_ADMIN already have exam and interview permissions (migration 093),
-- but were missing merit generation and offer dispatch permissions.

BEGIN;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name IN ('EXAM_CELL', 'EXAM_CELL_ADMIN')
  AND p.code IN (
    'admission.merit.generate',
    'admission.offer.manage',
    'admission.view_all'
  )
ON CONFLICT DO NOTHING;

COMMIT;
