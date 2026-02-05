-- ==========================================
-- 1. PERFORMANCE INDEXES
-- ==========================================

-- Standard lookups
CREATE INDEX IF NOT EXISTS idx_users_school_id ON public.users(school_id);
CREATE INDEX IF NOT EXISTS idx_admissions_school_id ON public.admissions(school_id);
CREATE INDEX IF NOT EXISTS idx_admissions_applicant_user_id ON public.admissions(applicant_user_id);
CREATE INDEX IF NOT EXISTS idx_students_school_id ON public.students(school_id);
CREATE INDEX IF NOT EXISTS idx_students_admission_id ON public.students(admission_id);

-- Academic Module
CREATE INDEX IF NOT EXISTS idx_classes_school_id ON public.classes(school_id);
CREATE INDEX IF NOT EXISTS idx_sections_class_id ON public.sections(class_id);
CREATE INDEX IF NOT EXISTS idx_student_sections_student_id ON public.student_sections(student_id);
CREATE INDEX IF NOT EXISTS idx_student_sections_section_id ON public.student_sections(section_id);
CREATE INDEX IF NOT EXISTS idx_faculty_sections_faculty_id ON public.faculty_sections(faculty_user_id);
CREATE INDEX IF NOT EXISTS idx_faculty_sections_section_id ON public.faculty_sections(section_id);

-- Exam Module
CREATE INDEX IF NOT EXISTS idx_subjects_class_id ON public.subjects(class_id);
CREATE INDEX IF NOT EXISTS idx_exams_school_id ON public.exams(school_id);
CREATE INDEX IF NOT EXISTS idx_exam_subjects_exam_id ON public.exam_subjects(exam_id);
CREATE INDEX IF NOT EXISTS idx_marks_student_id ON public.marks(student_id);
CREATE INDEX IF NOT EXISTS idx_marks_exam_id ON public.marks(exam_id);

-- Attendance Module
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_section_id ON public.attendance_sessions(section_id);
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_date ON public.attendance_sessions(date);
CREATE INDEX IF NOT EXISTS idx_attendance_records_student_id ON public.attendance_records(student_id);

-- Timetable Module
CREATE INDEX IF NOT EXISTS idx_timetable_slots_section_id ON public.timetable_slots(section_id);
CREATE INDEX IF NOT EXISTS idx_timetable_slots_faculty_id ON public.timetable_slots(faculty_user_id);

-- Finance Module
CREATE INDEX IF NOT EXISTS idx_student_fees_student_id ON public.student_fees(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_student_id ON public.payments(student_id);

-- ==========================================
-- 2. DATA INTEGRITY (CHECK CONSTRAINTS)
-- ==========================================

-- Ensure status enums are consistent
ALTER TABLE public.admissions DROP CONSTRAINT IF EXISTS check_admission_status;
ALTER TABLE public.admissions ADD CONSTRAINT check_admission_status CHECK (status IN ('draft', 'submitted', 'reviewing', 'approved', 'rejected'));

ALTER TABLE public.students DROP CONSTRAINT IF EXISTS check_student_status;
ALTER TABLE public.students ADD CONSTRAINT check_student_status CHECK (status IN ('active', 'inactive', 'graduated', 'withdrawn'));

-- ==========================================
-- 3. RLS AUDIT & HARDENING
-- ==========================================

-- Ensure NO table is accidentally permissive.
-- We'll look for any table and ensure RLS is definitely enabled.

DO $$ 
DECLARE 
    tbl RECORD;
BEGIN
    FOR tbl IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl.tablename);
    END LOOP;
END $$;

-- Drop any developer fallback policies that might be too permissive (e.g. "Allow all")
-- Note: Usually these are named "Allow all" or "Public view" during dev. 
-- For MVP production hardening, we rely on the specific policies created in phases 0-9.

-- ==========================================
-- 4. UTILS
-- ==========================================

-- Ensure current school ID function is deterministic and cached if possible (Security Definer)
CREATE OR REPLACE FUNCTION public.get_my_school_id()
RETURNS UUID AS $$
    SELECT school_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;
