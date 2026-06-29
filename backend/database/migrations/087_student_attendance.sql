-- ==================================================
-- 087_student_attendance.sql
-- Phase 4 Sprint 8 Student Attendance & Leave Management
-- ==================================================

BEGIN;

-- 1. ATTENDANCE SESSIONS TABLE (Daily homeroom session trackers)
CREATE TABLE IF NOT EXISTS public.student_attendance_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
    grade TEXT NOT NULL,
    section_id UUID NOT NULL,
    date DATE NOT NULL,
    session_status TEXT NOT NULL DEFAULT 'OPEN' CHECK (session_status IN ('OPEN', 'CLOSED')),
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_section_date UNIQUE (school_id, academic_year_id, grade, section_id, date)
);

-- 2. DAILY ATTENDANCE RECORDS
CREATE TABLE IF NOT EXISTS public.student_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.student_attendance_sessions(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL DEFAULT 'PRESENT' CHECK (status IN ('PRESENT', 'ABSENT', 'LATE', 'HALF_DAY')),
    remarks TEXT,
    marked_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    marked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_session_student UNIQUE (session_id, student_id)
);

-- 3. PERIOD-WISE ATTENDANCE (Subject/Lecture check-ins)
CREATE TABLE IF NOT EXISTS public.student_period_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    period_number INT NOT NULL,
    subject_id UUID, -- Logical subject ID from class timetable
    status TEXT NOT NULL CHECK (status IN ('PRESENT', 'ABSENT', 'LATE')),
    marked_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    marked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_period_student UNIQUE (student_id, date, period_number)
);

-- 4. ATTENDANCE HISTORICAL LOGS
CREATE TABLE IF NOT EXISTS public.student_attendance_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attendance_id UUID REFERENCES public.student_attendance(id) ON DELETE CASCADE NOT NULL,
    old_status TEXT NOT NULL,
    new_status TEXT NOT NULL,
    changed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    reason TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. LEAVE TYPES
CREATE TABLE IF NOT EXISTS public.student_leave_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    type_name TEXT NOT NULL, -- e.g. 'Sick Leave', 'Casual Leave', 'Medical'
    max_days INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_school_leave_type UNIQUE (school_id, type_name)
);

-- 6. LEAVE REQUESTS
CREATE TABLE IF NOT EXISTS public.student_leave_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    leave_type_id UUID REFERENCES public.student_leave_types(id) ON DELETE CASCADE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'COMPLETED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. LEAVE APPROVALS LOG
CREATE TABLE IF NOT EXISTS public.student_leave_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES public.student_leave_requests(id) ON DELETE CASCADE NOT NULL,
    approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    remarks TEXT
);

-- 8. ATTENDANCE CORRECTION REQUESTS
CREATE TABLE IF NOT EXISTS public.student_attendance_corrections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attendance_id UUID REFERENCES public.student_attendance(id) ON DELETE CASCADE NOT NULL,
    requested_status TEXT NOT NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    processed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. HOLIDAYS CALENDAR
CREATE TABLE IF NOT EXISTS public.student_holidays (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    holiday_date DATE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_school_holiday UNIQUE (school_id, holiday_date)
);

-- 10. WORKING DAYS CONFIGURATIONS
CREATE TABLE IF NOT EXISTS public.student_working_days (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
    grade TEXT NOT NULL,
    month INT NOT NULL, -- e.g. 6 (June)
    total_working_days INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_school_working UNIQUE (school_id, academic_year_id, grade, month)
);

-- 11. BIOMETRIC DEVICES REGISTER
CREATE TABLE IF NOT EXISTS public.student_biometric_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    device_name TEXT NOT NULL,
    device_code TEXT UNIQUE NOT NULL,
    location TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. BIOMETRIC LOGS RAW REGISTER
CREATE TABLE IF NOT EXISTS public.student_biometric_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_code TEXT REFERENCES public.student_biometric_devices(device_code) ON DELETE CASCADE NOT NULL,
    student_admission_no TEXT NOT NULL,
    scan_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'UNPROCESSED' CHECK (status IN ('UNPROCESSED', 'PROCESSED', 'FAILED')),
    failure_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. BIOMETRIC SYNC JOBS TRACKER
CREATE TABLE IF NOT EXISTS public.student_attendance_sync_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_code TEXT REFERENCES public.student_biometric_devices(device_code) ON DELETE CASCADE NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    records_processed INT NOT NULL DEFAULT 0,
    status TEXT NOT NULL CHECK (status IN ('RUNNING', 'COMPLETED', 'FAILED'))
);

-- 14. STUDENT ATTENDANCE MONTHLY SUMMARY (Aggregate cache for performance)
CREATE TABLE IF NOT EXISTS public.student_attendance_summary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
    month INT NOT NULL,
    total_present INT NOT NULL DEFAULT 0,
    total_absent INT NOT NULL DEFAULT 0,
    total_late INT NOT NULL DEFAULT 0,
    attendance_percentage NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    last_calculated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_student_monthly_summary UNIQUE (student_id, academic_year_id, month)
);

-- 15. ATTENDANCE SYSTEM GENERATED REPORTS
CREATE TABLE IF NOT EXISTS public.student_attendance_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
    report_type TEXT NOT NULL, -- e.g. 'Defaulters', 'Monthly Summary'
    parameters JSONB NOT NULL,
    file_url TEXT,
    generated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 16. ATTENDANCE WORKFLOW RULES (Controls correction request status paths)
CREATE TABLE IF NOT EXISTS public.attendance_workflow_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_status TEXT NOT NULL,
    to_status TEXT NOT NULL,
    role TEXT NOT NULL,
    allowed BOOLEAN DEFAULT true,
    CONSTRAINT unique_attendance_workflow UNIQUE (from_status, to_status, role)
);

-- 17. ATTENDANCE NOTIFICATIONS QUEUE
CREATE TABLE IF NOT EXISTS public.attendance_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    parent_email TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SENT', 'FAILED')),
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 18. DASHBOARD METRICS SUMMARY CACHE
CREATE TABLE IF NOT EXISTS public.attendance_dashboard_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    total_enrolled INT NOT NULL,
    total_present INT NOT NULL,
    total_absent INT NOT NULL,
    total_late INT NOT NULL,
    average_attendance_percentage NUMERIC(5,2) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_school_date_metrics UNIQUE (school_id, date)
);

-- ==================================================
-- SEEDS AND METADATA DEFINITIONS
-- ==================================================

-- Seed default leave types for all schools
INSERT INTO public.student_leave_types (school_id, type_name, max_days)
SELECT id, 'Sick Leave', 15 FROM public.schools
UNION ALL
SELECT id, 'Casual Leave', 10 FROM public.schools
UNION ALL
SELECT id, 'Medical Leave', 30 FROM public.schools
ON CONFLICT DO NOTHING;

-- Seed default correction workflow rules
INSERT INTO public.attendance_workflow_rules (from_status, to_status, role, allowed) VALUES
('PENDING', 'APPROVED', 'admin', true),
('PENDING', 'APPROVED', 'teacher', true),
('PENDING', 'REJECTED', 'admin', true),
('PENDING', 'REJECTED', 'teacher', true)
ON CONFLICT DO NOTHING;

-- Seed Feature Flags
INSERT INTO public.feature_flags (module, feature_key, enabled, environment, description) VALUES
('student', 'attendance_tracking', true, 'development', 'Allows homeroom check-in registers'),
('student', 'period_attendance', true, 'development', 'Allows lecture/subject attendance registers'),
('student', 'leave_management', true, 'development', 'Allows leave application and balance tracker'),
('student', 'biometric_sync', true, 'development', 'Allows synchronizing physical device logs'),
('student', 'attendance_analytics', true, 'development', 'Allows calculating monthly summaries')
ON CONFLICT (module, feature_key, environment, tenant_id) DO NOTHING;

-- Seed AMS Permissions
INSERT INTO public.permissions (code, description) VALUES
('attendance.mark', 'Allows teachers/admins to take attendance'),
('attendance.verify', 'Allows viewing daily analytics reports'),
('attendance.leave.apply', 'Allows parents to request student leaves'),
('attendance.leave.approve', 'Allows admins/principals to verify leaves'),
('attendance.correction.approve', 'Allows teachers to approve correction requests'),
('attendance.sync', 'Allows syncing biometric scan registers')
ON CONFLICT (code) DO NOTHING;

COMMIT;
