-- =======================================================
-- MIGRATION: 064_exam_reporting_analytics
-- DESCRIPTION: Implements Read-Only Views for Exam Dashboards, Analytics, and Compliance.
-- =======================================================

BEGIN;

-- 1. VIEW: EXAM COMPLIANCE METRICS
-- (Eligible vs Seated vs Present vs Passed)
CREATE OR REPLACE VIEW public.v_exam_compliance_metrics AS
SELECT 
    e.id AS exam_id,
    e.school_id,
    e.name AS exam_name,
    e.term,
    e.academic_year_id,
    
    -- Count Eligible (from snapshots)
    (SELECT COUNT(*) FROM public.exam_eligibility_snapshots WHERE exam_id = e.id) AS count_eligible,
    
    -- Count Seated (from allocations)
    (SELECT COUNT(DISTINCT student_id) FROM public.exam_seating_allocations sa 
     JOIN public.exam_schedules esc ON sa.exam_schedule_id = esc.id 
     WHERE esc.exam_id = e.id) AS count_seated,
     
    -- Count Appeared (At least one present mark in any subject)
    (SELECT COUNT(DISTINCT student_id) FROM public.exam_attendance ea
     JOIN public.exam_schedules esc ON ea.exam_schedule_id = esc.id
     WHERE esc.exam_id = e.id AND ea.status = 'PRESENT') AS count_appeared,
     
    -- Result Stats (Published)
    (SELECT COUNT(*) FROM public.student_result_summaries WHERE exam_id = e.id AND result_status = 'PASS') AS count_passed,
    (SELECT COUNT(*) FROM public.student_result_summaries WHERE exam_id = e.id AND result_status = 'FAIL') AS count_failed,
    (SELECT AVG(percentage) FROM public.student_result_summaries WHERE exam_id = e.id) AS avg_percentage

FROM public.exams e;

-- 2. VIEW: SUBJECT PERFORMANCE ANALYTICS
CREATE OR REPLACE VIEW public.v_subject_performance_analytics AS
SELECT 
    esc.id AS schedule_id,
    esc.exam_id,
    esc.subject_id,
    s.name AS subject_name,
    s.code AS subject_code,
    esc.max_marks,
    esc.passing_marks,
    
    COUNT(m.student_id) AS students_evaluated,
    AVG(m.marks_obtained) AS avg_obtained,
    MAX(m.marks_obtained) AS highest_obtained,
    MIN(m.marks_obtained) AS lowest_obtained,
    
    COUNT(CASE WHEN m.marks_obtained >= esc.passing_marks THEN 1 END) AS count_passed,
    COUNT(CASE WHEN m.marks_obtained < esc.passing_marks THEN 1 END) AS count_failed,
    
    -- Malpractice Count
    (SELECT COUNT(*) FROM public.exam_attendance WHERE exam_schedule_id = esc.id AND status = 'MALPRACTICE') AS count_malpractice

FROM public.exam_schedules esc
JOIN public.subjects s ON esc.subject_id = s.id
LEFT JOIN public.marks m ON m.exam_id = esc.exam_id AND m.subject_id = esc.subject_id
GROUP BY esc.id, esc.exam_id, esc.subject_id, s.name, s.code, esc.max_marks, esc.passing_marks;

-- 3. VIEW: SECTION PERFORMANCE ANALYTICS
CREATE OR REPLACE VIEW public.v_section_performance_analytics AS
SELECT 
    rs.exam_id,
    sec.id AS section_id,
    sec.name AS section_name,
    cl.name AS class_name,
    
    COUNT(rs.id) AS student_count,
    AVG(rs.percentage) AS avg_percentage,
    COUNT(CASE WHEN rs.result_status = 'PASS' THEN 1 END) AS count_passed,
    COUNT(CASE WHEN rs.result_status = 'FAIL' THEN 1 END) AS count_failed

FROM public.student_result_summaries rs
JOIN public.student_sections ss ON rs.student_id = ss.student_id 
JOIN public.exams e ON rs.exam_id = e.id AND ss.academic_year_id = e.academic_year_id
JOIN public.sections sec ON ss.section_id = sec.id
JOIN public.classes cl ON sec.class_id = cl.id
GROUP BY rs.exam_id, sec.id, sec.name, cl.name;

-- 4. VIEW: AUDIT LOGS (Compliance Export Focused)
CREATE OR REPLACE VIEW public.v_exam_audit_comprehensive AS
SELECT 
    l.id,
    l.school_id,
    l.action,
    l.details,
    u.full_name AS performed_by_name,
    l.created_at,
    -- Extract common fields from JSONB for easier filtering
    (l.details->>'exam_id')::UUID AS相关_exam_id,
    (l.details->>'student_id')::UUID AS相关_student_id,
    (l.details->>'reason')::TEXT AS reason
FROM public.academic_automation_logs l
LEFT JOIN public.users u ON l.performed_by = u.id
WHERE l.action IN ('ELIGIBILITY_FREEZE', 'ELIGIBILITY_OVERRIDE', 'EXAM_SUBJECT_LOCKED', 'EXAM_SUBJECT_UNLOCKED', 'RESULT_PUBLISH');

COMMIT;
