-- Grant RECEPTIONIST read access to enquiries (required for AMAT Stage 1 list view)
BEGIN;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r, public.permissions p
WHERE r.name = 'RECEPTIONIST'
  AND p.code = 'admission.enquiry.view'
ON CONFLICT DO NOTHING;

COMMIT;
