
-- Seed Standard CBSE-like Grading Scale
INSERT INTO public.grading_scales (school_id, name, min_score, max_score, grade_label, grade_point, description)
SELECT 
    id as school_id, 
    'Standard Grading', 
    91, 100, 'A1', 10.0, 'Outstanding'
FROM public.schools LIMIT 1;

INSERT INTO public.grading_scales (school_id, name, min_score, max_score, grade_label, grade_point, description)
SELECT id, 'Standard Grading', 81, 90, 'A2', 9.0, 'Excellent' FROM public.schools LIMIT 1;

INSERT INTO public.grading_scales (school_id, name, min_score, max_score, grade_label, grade_point, description)
SELECT id, 'Standard Grading', 71, 80, 'B1', 8.0, 'Very Good' FROM public.schools LIMIT 1;

INSERT INTO public.grading_scales (school_id, name, min_score, max_score, grade_label, grade_point, description)
SELECT id, 'Standard Grading', 61, 70, 'B2', 7.0, 'Good' FROM public.schools LIMIT 1;

INSERT INTO public.grading_scales (school_id, name, min_score, max_score, grade_label, grade_point, description)
SELECT id, 'Standard Grading', 51, 60, 'C1', 6.0, 'Average' FROM public.schools LIMIT 1;

INSERT INTO public.grading_scales (school_id, name, min_score, max_score, grade_label, grade_point, description)
SELECT id, 'Standard Grading', 41, 50, 'C2', 5.0, 'Below Average' FROM public.schools LIMIT 1;

INSERT INTO public.grading_scales (school_id, name, min_score, max_score, grade_label, grade_point, description)
SELECT id, 'Standard Grading', 33, 40, 'D', 4.0, 'Marginal' FROM public.schools LIMIT 1;

INSERT INTO public.grading_scales (school_id, name, min_score, max_score, grade_label, grade_point, description)
SELECT id, 'Standard Grading', 0, 32, 'E', 0.0, 'Needs Improvement' FROM public.schools LIMIT 1;
