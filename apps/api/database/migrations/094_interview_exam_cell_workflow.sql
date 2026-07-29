-- Interview workflow rules for exam cell roles
BEGIN;

INSERT INTO public.interview_workflow_rules (from_status, to_status, role, allowed) VALUES
('SCHEDULED', 'COMPLETED', 'EXAM_CELL', true),
('SCHEDULED', 'COMPLETED', 'EXAM_CELL_ADMIN', true),
('COMPLETED', 'EVALUATED', 'EXAM_CELL', true),
('COMPLETED', 'EVALUATED', 'EXAM_CELL_ADMIN', true),
('SCHEDULED', 'EVALUATED', 'EXAM_CELL', true),
('SCHEDULED', 'EVALUATED', 'EXAM_CELL_ADMIN', true)
ON CONFLICT (from_status, to_status, role) DO UPDATE SET allowed = EXCLUDED.allowed;

COMMIT;
