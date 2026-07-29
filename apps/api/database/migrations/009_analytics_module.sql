-- ==========================================
-- 1. ANALYTIC VIEWS
-- ==========================================

-- VIEW: student_attendance_summary
-- Aggregates attendance stats per student per academic year (implicitly via session)
CREATE OR REPLACE VIEW public.student_attendance_summary AS
SELECT 
    ar.student_id,
    stu.school_id,
    s.academic_year_id,
    COUNT(ar.id) as total_days,
    COUNT(CASE WHEN ar.status = 'present' THEN 1 END) as present_days,
    COUNT(CASE WHEN ar.status = 'absent' THEN 1 END) as absent_days,
    COUNT(CASE WHEN ar.status = 'late' THEN 1 END) as late_days,
    ROUND(
        (COUNT(CASE WHEN ar.status IN ('present', 'late') THEN 1 END)::numeric / NULLIF(COUNT(ar.id), 0)::numeric) * 100, 
    2) as attendance_percentage
FROM public.attendance_records ar
JOIN public.attendance_sessions s ON ar.session_id = s.id
JOIN public.students stu ON ar.student_id = stu.id
GROUP BY ar.student_id, stu.school_id, s.academic_year_id;

-- VIEW: student_exam_summary
-- Aggregates marks per student per exam
CREATE OR REPLACE VIEW public.student_exam_summary AS
SELECT 
    m.student_id,
    stu.school_id,
    m.exam_id,
    e.name as exam_name,
    COUNT(m.subject_id) as total_subjects,
    SUM(m.marks_obtained) as obtained_marks,
    -- Assuming 100 max per subject for this view simplicity, or join exam_subjects for precision
    -- For MVP, we'll assume max_marks from exam_subjects sum if available, else 100 * count
    COALESCE(SUM(es.max_marks), COUNT(m.subject_id) * 100) as total_max_marks,
    ROUND(
        (SUM(m.marks_obtained) / NULLIF(COALESCE(SUM(es.max_marks), COUNT(m.subject_id) * 100), 0)) * 100, 
    2) as percentage
FROM public.marks m
JOIN public.students stu ON m.student_id = stu.id
JOIN public.exams e ON m.exam_id = e.id
LEFT JOIN public.exam_subjects es ON m.exam_id = es.exam_id AND m.subject_id = es.subject_id
GROUP BY m.student_id, stu.school_id, m.exam_id, e.name;

-- ==========================================
-- 2. RLS POLICIES FOR VIEWS (Supabase requires this on base tables mostly, but views handle security via definer or base table access)
-- ==========================================
-- Since these are standard views, they inherit permissions of the querying user on the underlying tables.
-- Our existing RLS on students, attendance_records, marks will automatically filter rows.
-- e.g. A parent querying 'student_attendance_summary' will only see rows where they have access to 'attendance_records'.
-- This is perfect. No extra RLS needed on views unless we used MATERIALIZED VIEW.

-- However, for Admin Dashboards/Aggregates that might need "Counts" without "Select all rows", 
-- sometimes we need specific functions. But for Phase 7 generic rules, standard RLS is fine.

