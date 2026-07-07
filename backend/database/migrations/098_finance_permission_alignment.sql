-- 098_finance_permission_alignment.sql
BEGIN;

-- 1. Create standardized permissions
INSERT INTO public.permissions (code, description) VALUES
('fees.structure.view', 'View school fee structures list'),
('fees.structure.manage', 'Create, edit, and delete school fee structures'),
('fees.demand.view', 'View allocated fee demands'),
('fees.demand.generate', 'Generate and assign student fee demands'),
('fees.payment.view', 'View payment transaction logs'),
('fees.payment.collect', 'Collect fees and record payments'),
('fees.receipt.generate', 'Generate payment receipts'),
('fees.waiver.approve', 'Approve and record concessions/waivers'),
('fees.refund.process', 'Process fee refunds'),
('fees.view', 'General dashboard and ledger view permission'),
('admission.fees.initialize', 'Allows initialization of billing structures on applications')
ON CONFLICT (code) DO NOTHING;

-- 2. Map permissions to ADMIN
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'ADMIN'
  AND p.code IN (
    'fees.structure.view',
    'fees.structure.manage',
    'fees.demand.view',
    'fees.demand.generate',
    'fees.payment.view',
    'fees.payment.collect',
    'fees.receipt.generate',
    'fees.waiver.approve',
    'fees.refund.process',
    'fees.view',
    'admission.fees.initialize'
  )
ON CONFLICT DO NOTHING;

-- 3. Map permissions to FINANCE_OFFICER and ACCOUNTANT
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name IN ('FINANCE_OFFICER', 'ACCOUNTANT')
  AND p.code IN (
    'fees.structure.view',
    'fees.structure.manage',
    'fees.demand.view',
    'fees.demand.generate',
    'fees.payment.view',
    'fees.payment.collect',
    'fees.receipt.generate',
    'fees.waiver.approve',
    'fees.refund.process',
    'fees.view'
  )
ON CONFLICT DO NOTHING;

-- 4. Map permissions to ADMISSION_OFFICER
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'ADMISSION_OFFICER'
  AND p.code IN (
    'fees.structure.view',
    'fees.demand.view',
    'admission.fees.initialize'
  )
ON CONFLICT DO NOTHING;

-- 5. Map permissions to COUNSELOR
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name IN ('COUNSELOR', 'COUNSELLOR')
  AND p.code IN (
    'admission.fees.initialize'
  )
ON CONFLICT DO NOTHING;

COMMIT;
