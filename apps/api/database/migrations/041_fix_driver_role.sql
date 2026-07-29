-- 041_fix_driver_role.sql
-- Ensure DRIVER role exists for Import System

INSERT INTO public.roles (name, description)
SELECT 'DRIVER', 'School vehicle driver with limited dashboard access'
WHERE NOT EXISTS (
    SELECT 1 FROM public.roles WHERE name = 'DRIVER'
);

-- Note: Permissions for DRIVER (e.g., TRIP_RUNNER) should already be seeded in 035_transport_rbac.sql
-- If not, they are handled separately. This file only ensures the role identity exists.
