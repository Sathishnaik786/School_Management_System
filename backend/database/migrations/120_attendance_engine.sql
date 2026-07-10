-- ==================================================
-- Migration: 120_attendance_engine.sql
-- Bounded Context: Attendance & Academic Engagement Engine
-- ==================================================

BEGIN;

-- 1. ATTENDANCE CALENDARS
CREATE TABLE IF NOT EXISTS public.attendance_calendars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    campus_id UUID NOT NULL,
    branch_id UUID NOT NULL,
    academic_year_id UUID NOT NULL,
    calendar_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. CALENDAR DAYS
CREATE TABLE IF NOT EXISTS public.attendance_calendar_days (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    calendar_id UUID REFERENCES public.attendance_calendars(id) ON DELETE CASCADE NOT NULL,
    day_date DATE NOT NULL,
    day_type TEXT NOT NULL CHECK (day_type IN ('WORKING', 'HOLIDAY', 'SPECIAL', 'MAKEUP')) DEFAULT 'WORKING',
    remarks TEXT
);

-- 3. ATTENDANCE HOLIDAYS
CREATE TABLE IF NOT EXISTS public.attendance_holidays (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    holiday_date DATE NOT NULL,
    holiday_name TEXT NOT NULL
);

-- 4. SPECIAL DAYS
CREATE TABLE IF NOT EXISTS public.attendance_special_days (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    special_date DATE NOT NULL,
    description TEXT NOT NULL
);

-- 5. MAKEUP CLASSES
CREATE TABLE IF NOT EXISTS public.attendance_makeup_classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    makeup_date DATE NOT NULL,
    original_timetable_date DATE NOT NULL
);

-- 6. ATTENDANCE SESSIONS
CREATE TABLE IF NOT EXISTS public.attendance_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    campus_id UUID NOT NULL,
    branch_id UUID NOT NULL,
    academic_year_id UUID NOT NULL,
    session_date DATE NOT NULL,
    timetable_slot_id UUID NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('DRAFT', 'SUBMITTED', 'APPROVED', 'LOCKED')) DEFAULT 'DRAFT',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 7. SESSION LOCKS
CREATE TABLE IF NOT EXISTS public.attendance_session_locks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.attendance_sessions(id) ON DELETE CASCADE NOT NULL,
    locked_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    locked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    reason TEXT NOT NULL
);

-- 8. WORKFLOW LOGS
CREATE TABLE IF NOT EXISTS public.attendance_session_workflow (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.attendance_sessions(id) ON DELETE CASCADE NOT NULL,
    approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    role_level TEXT NOT NULL,
    decision TEXT NOT NULL CHECK (decision IN ('PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED')),
    comments TEXT
);

-- 9. ATTENDANCE RECORDS (Core marking status/source)
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.attendance_sessions(id) ON DELETE CASCADE NOT NULL,
    student_id UUID NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('PRESENT', 'ABSENT', 'LATE', 'LEFT_EARLY', 'MEDICAL', 'ON_DUTY', 'SPORTS', 'FIELD_VISIT', 'ONLINE', 'HYBRID', 'EXEMPTED')),
    source TEXT NOT NULL CHECK (source IN ('MANUAL', 'QR', 'RFID', 'BIOMETRIC', 'FACE_RECOGNITION', 'MOBILE_APP', 'NFC', 'API_IMPORT')),
    marked_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    marked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 10. ATTENDANCE RECORD AUDIT HISTORY VERSIONS
CREATE TABLE IF NOT EXISTS public.attendance_record_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attendance_record_id UUID REFERENCES public.attendance_records(id) ON DELETE CASCADE NOT NULL,
    previous_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    changed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    changed_reason TEXT NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 11. DEVICES REGISTER
CREATE TABLE IF NOT EXISTS public.attendance_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    device_name TEXT NOT NULL,
    device_ip TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('ONLINE', 'OFFLINE')) DEFAULT 'ONLINE'
);

-- 12. OFFLINE RETRY QUEUE
CREATE TABLE IF NOT EXISTS public.attendance_device_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID REFERENCES public.attendance_devices(id) ON DELETE CASCADE NOT NULL,
    raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'PROCESSED', 'FAILED')) DEFAULT 'PENDING',
    retry_count INT NOT NULL DEFAULT 0
);

-- 13. DEVICE HARDWARE SCAN LOGS
CREATE TABLE IF NOT EXISTS public.attendance_device_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID REFERENCES public.attendance_devices(id) ON DELETE CASCADE NOT NULL,
    student_id UUID NOT NULL,
    scan_timestamp TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 14. POLICY ENGINE RULES
CREATE TABLE IF NOT EXISTS public.attendance_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    minimum_percentage NUMERIC(5,2) NOT NULL DEFAULT 75.00,
    late_threshold_minutes INT NOT NULL DEFAULT 15,
    condonation_limit INT NOT NULL DEFAULT 5
);

-- 15. ELIGIBILITY REGISTRY
CREATE TABLE IF NOT EXISTS public.attendance_eligibility (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL,
    subject_id UUID NOT NULL,
    attendance_percentage NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    is_eligible BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 16. EVENT OUTBOX PATTERN
CREATE TABLE IF NOT EXISTS public.attendance_event_outbox (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_name TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'PROCESSED')) DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 17. LEAVE REQUESTS
CREATE TABLE IF NOT EXISTS public.student_leave_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    leave_type TEXT NOT NULL CHECK (leave_type IN ('MEDICAL', 'SPORTS', 'DUTY', 'INTERNSHIP', 'CASUAL')),
    reason TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')) DEFAULT 'PENDING'
);

-- 18. EXCEPTION REQUESTS workflow
CREATE TABLE IF NOT EXISTS public.attendance_exception_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL,
    session_id UUID REFERENCES public.attendance_sessions(id) ON DELETE CASCADE NOT NULL,
    exception_type TEXT NOT NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')) DEFAULT 'PENDING'
);

-- 19. ATTENDANCE STATISTICS
CREATE TABLE IF NOT EXISTS public.student_attendance_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL,
    overall_percentage NUMERIC(5,2) NOT NULL DEFAULT 100.00,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- RLS Configuration
ALTER TABLE public.attendance_calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_policies ENABLE ROW LEVEL SECURITY;

-- Tenant Select policies
CREATE POLICY "Tenant select calendars" ON public.attendance_calendars FOR SELECT TO authenticated USING (
    school_id = public.get_my_school_id()
);
CREATE POLICY "Admin manage calendars" ON public.attendance_calendars FOR ALL TO authenticated USING (
    school_id = public.get_my_school_id()
);

COMMIT;
