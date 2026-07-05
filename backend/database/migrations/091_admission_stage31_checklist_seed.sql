-- ==================================================
-- 091_admission_stage31_checklist_seed.sql
-- Seed grade-wise document checklists for all schools/years
-- ==================================================

BEGIN;

INSERT INTO public.document_checklists (
    school_id,
    academic_year_id,
    grade,
    admission_type,
    document_type_id,
    mandatory,
    minimum_copies
)
SELECT
    s.id,
    ay.id,
    g.grade,
    'Regular',
    dt.id,
    dt.mandatory,
    1
FROM public.schools s
CROSS JOIN public.academic_years ay
CROSS JOIN (
    VALUES
        ('Grade 1'), ('Grade 2'), ('Grade 3'), ('Grade 4'), ('Grade 5'),
        ('Grade 6'), ('Grade 7'), ('Grade 8'), ('Grade 9'), ('Grade 10'),
        ('Grade 11'), ('Grade 12')
) AS g(grade)
CROSS JOIN public.document_types dt
WHERE dt.active = true
ON CONFLICT (school_id, academic_year_id, grade, admission_type, document_type_id) DO NOTHING;

COMMIT;
