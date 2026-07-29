-- ==================================================
-- 102_admission_assessment_rbac.sql
-- Maps roles to new permissions for Admission Assessment Engine
-- ==================================================

BEGIN;

-- Insert new permissions
INSERT INTO public.permissions (code, description) VALUES
('admission.assessment.manage', 'Allows configuring subjects, templates, and scheduling for assessments'),
('admission.assessment.evaluate', 'Allows grading and publishing results in evaluation pipeline'),
('admission.assessment.write', 'Allows taking pre-admission online assessments')
ON CONFLICT (code) DO NOTHING;

-- Map permissions to roles
-- EXAM_CELL_ADMIN and ADMIN permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name IN ('EXAM_CELL_ADMIN', 'ADMIN')
AND p.code IN ('admission.assessment.manage', 'admission.assessment.evaluate')
ON CONFLICT DO NOTHING;

-- EXAM_CELL permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name IN ('EXAM_CELL')
AND p.code IN ('admission.assessment.evaluate')
ON CONFLICT DO NOTHING;

-- PARENT permissions (candidates)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name IN ('PARENT')
AND p.code IN ('admission.assessment.write')
ON CONFLICT DO NOTHING;

COMMIT;
