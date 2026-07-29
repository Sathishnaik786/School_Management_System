-- ========================================================
-- PRODUCTION DIAGNOSTICS: BULK CLASS & SECTION ASSIGNMENT
-- ========================================================
-- This script identifies the current state of students, 
-- classes, and academic years before performing bulk 
-- assignments to ensure safety and logic consistency.

-- 1. IDENTIFY ACTIVE ACADEMIC YEARS
-- Red Flag: If more than one row appears, the system is in a conflicted state.
SELECT id, year_label, is_active, status 
FROM public.academic_years 
WHERE is_active = true OR status = 'ACTIVE';

-- 2. DETECT UNASSIGNED STUDENTS (ORPHANS)
-- Groups students by the grade they applied for who have no section assignment.
SELECT 
    a.grade_applied_for, 
    COUNT(s.id) as unassigned_count
FROM public.students s
JOIN public.admissions a ON s.admission_id = a.id
WHERE NOT EXISTS (
    SELECT 1 FROM public.student_sections ss 
    WHERE ss.student_id = s.id 
    AND ss.academic_year_id = a.academic_year_id -- Or match against the active year
)
GROUP BY a.grade_applied_for
ORDER BY a.grade_applied_for;

-- 3. VERIFY GRADE NAME CONSISTENCY
-- Detects if 'grade_applied_for' in admissions matches 'name' in classes.
-- If they don't match, auto-distribution will find 0 students.
SELECT DISTINCT a.grade_applied_for 
FROM public.admissions a
LEFT JOIN public.classes c ON a.grade_applied_for = c.name
WHERE c.id IS NULL;

-- 4. SECTION CAPACITY AUDIT
-- Detects sections nearing or at the 15-student hard limit.
SELECT 
    c.name as class_name,
    s.name as section_name,
    COUNT(ss.id) as current_students,
    (15 - COUNT(ss.id)) as remaining_capacity
FROM public.sections s
JOIN public.classes c ON s.class_id = c.id
LEFT JOIN public.student_sections ss ON s.id = ss.section_id
GROUP BY c.name, s.name
HAVING COUNT(ss.id) >= 13
ORDER BY current_students DESC;

-- 5. DUPLICATE ASSIGNMENT CHECK
-- Detects if any student is assigned to multiple sections in the same year.
SELECT 
    student_id, 
    academic_year_id, 
    COUNT(*) as assignment_count
FROM public.student_sections
GROUP BY student_id, academic_year_id
HAVING COUNT(*) > 1;

-- 6. CLASS SECTION PAIR CHECK
-- Verifies that every class has at least an 'A' and 'B' section.
SELECT 
    c.name as class_name,
    COUNT(s.id) as section_count,
    STRING_AGG(s.name, ', ') as section_names
FROM public.classes c
LEFT JOIN public.sections s ON c.id = s.class_id
GROUP BY c.name
HAVING COUNT(s.id) < 2;
