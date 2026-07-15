-- ==================================================
-- Migration: 123_examination_operations_schema.sql
-- Bounded Context: Examination Operations
-- ==================================================

BEGIN;

-- 1. CENTERS, BUILDINGS, ROOMS (scalable venues)
CREATE TABLE IF NOT EXISTS public.exam_centers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    campus TEXT,
    code TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_school_center_code UNIQUE (school_id, code)
);

CREATE TABLE IF NOT EXISTS public.exam_buildings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    center_id UUID REFERENCES public.exam_centers(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    floors_count INTEGER DEFAULT 1 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.exam_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    building_id UUID REFERENCES public.exam_buildings(id) ON DELETE CASCADE NOT NULL,
    room_number TEXT NOT NULL,
    floor_number INTEGER DEFAULT 0 NOT NULL,
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    accessibility_supported BOOLEAN DEFAULT false NOT NULL,
    rows_count INTEGER DEFAULT 5 NOT NULL,
    cols_count INTEGER DEFAULT 5 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_building_room UNIQUE (building_id, room_number)
);

-- 2. SEATING TEMPLATES & LAYOUTS
CREATE TABLE IF NOT EXISTS public.seat_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    rows_count INTEGER NOT NULL CHECK (rows_count > 0),
    cols_count INTEGER NOT NULL CHECK (cols_count > 0),
    layout_matrix JSONB DEFAULT '[]'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.seat_layouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    room_id UUID REFERENCES public.exam_rooms(id) ON DELETE CASCADE NOT NULL,
    template_id UUID REFERENCES public.seat_templates(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 3. EXTRA SCHEDULING TABLES (schedule_sessions, schedule_rooms)
CREATE TABLE IF NOT EXISTS public.schedule_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL, -- e.g. "Morning Session", "Afternoon Session"
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.schedule_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    exam_schedule_id UUID REFERENCES public.exam_schedules(id) ON DELETE CASCADE NOT NULL,
    room_id UUID REFERENCES public.exam_rooms(id) ON DELETE CASCADE NOT NULL,
    allocated_capacity INTEGER NOT NULL CHECK (allocated_capacity >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_schedule_room UNIQUE (exam_schedule_id, room_id)
);

-- 4. SEAT ALLOCATIONS & AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.seat_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    exam_schedule_id UUID REFERENCES public.exam_schedules(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    room_id UUID REFERENCES public.exam_rooms(id) ON DELETE CASCADE NOT NULL,
    seat_number TEXT NOT NULL,
    status TEXT DEFAULT 'ALLOCATED' CHECK (status IN ('ALLOCATED', 'CHANGED', 'RELEASED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_student_schedule_seat_allocation UNIQUE (exam_schedule_id, student_id)
);

CREATE TABLE IF NOT EXISTS public.seat_allocation_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    allocation_id UUID REFERENCES public.seat_allocations(id) ON DELETE SET NULL,
    action TEXT NOT NULL, -- e.g., 'CREATE', 'CHANGE', 'RELEASE'
    old_seat TEXT,
    new_seat TEXT,
    performed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 5. CANDIDATE REGISTRATION
CREATE TABLE IF NOT EXISTS public.exam_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PENDING', 'VERIFIED', 'APPROVED', 'HALL_TICKET_GENERATED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_student_exam_registration UNIQUE (student_id, exam_id)
);

CREATE TABLE IF NOT EXISTS public.registration_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    registration_id UUID REFERENCES public.exam_registrations(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL,
    changed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.registration_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    registration_id UUID REFERENCES public.exam_registrations(id) ON DELETE CASCADE NOT NULL,
    document_name TEXT NOT NULL,
    document_url TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.registration_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    registration_id UUID REFERENCES public.exam_registrations(id) ON DELETE CASCADE NOT NULL,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb NOT NULL,
    performed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 6. DEDICATED HALL TICKETS & LOGS
CREATE TABLE IF NOT EXISTS public.hall_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    registration_id UUID REFERENCES public.exam_registrations(id) ON DELETE CASCADE NOT NULL,
    ticket_code TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'GENERATED' CHECK (status IN ('GENERATED', 'DOWNLOADED', 'REVOKED')),
    snapshot_data JSONB DEFAULT '{}'::jsonb NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.hall_ticket_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    hall_ticket_id UUID REFERENCES public.hall_tickets(id) ON DELETE CASCADE NOT NULL,
    action TEXT NOT NULL, -- e.g. 'DOWNLOAD', 'REISSUE', 'REVOKE'
    remarks TEXT,
    performed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 7. INVIGILATOR ASSIGNMENTS
CREATE TABLE IF NOT EXISTS public.invigilator_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    faculty_profile_id UUID REFERENCES public.faculty_profiles(id) ON DELETE CASCADE NOT NULL,
    available_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE (faculty_profile_id, available_date, start_time)
);

CREATE TABLE IF NOT EXISTS public.invigilator_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    exam_schedule_id UUID REFERENCES public.exam_schedules(id) ON DELETE CASCADE NOT NULL,
    room_id UUID REFERENCES public.exam_rooms(id) ON DELETE CASCADE NOT NULL,
    faculty_profile_id UUID REFERENCES public.faculty_profiles(id) ON DELETE CASCADE NOT NULL,
    role TEXT DEFAULT 'INVIGILATOR' CHECK (role IN ('CHIEF_SUPERINTENDENT', 'INVIGILATOR', 'RELIEVER')),
    status TEXT DEFAULT 'ASSIGNED' CHECK (status IN ('ASSIGNED', 'CONFIRMED', 'DECLINED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_invigilator_schedule UNIQUE (exam_schedule_id, faculty_profile_id)
);

-- 8. EXAM DAY ATTENDANCE (Harden and alter existing table to add school_id)
ALTER TABLE public.exam_attendance ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE;
ALTER TABLE public.exam_attendance ADD COLUMN IF NOT EXISTS entry_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.exam_attendance ADD COLUMN IF NOT EXISTS verified_via TEXT CHECK (verified_via IN ('QR_CODE', 'MANUAL', 'BIOMETRIC'));
ALTER TABLE public.exam_attendance ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

CREATE TABLE IF NOT EXISTS public.attendance_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    attendance_id UUID REFERENCES public.exam_attendance(id) ON DELETE CASCADE NOT NULL,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb NOT NULL,
    performed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 9. RESULT PUBLISHING WORKFLOW (Using prefix exam_result_publications to avoid table clashes)
CREATE TABLE IF NOT EXISTS public.exam_result_publications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'EVALUATED' CHECK (status IN ('EVALUATED', 'AUTO_VALIDATION', 'MODERATOR', 'EXAM_CELL', 'PRINCIPAL', 'PUBLISHED', 'ARCHIVED')),
    published_at TIMESTAMP WITH TIME ZONE,
    frozen BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_result_exam_publication UNIQUE (school_id, exam_id)
);

CREATE TABLE IF NOT EXISTS public.approval_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    publication_id UUID REFERENCES public.exam_result_publications(id) ON DELETE CASCADE NOT NULL,
    stage TEXT NOT NULL,
    approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'APPROVED' CHECK (status IN ('APPROVED', 'ROLLBACK')),
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 10. NOTIFICATION QUEUE & TIMELINE
CREATE TABLE IF NOT EXISTS public.notification_templates (
    code TEXT PRIMARY KEY,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    channel TEXT NOT NULL,
    subject TEXT,
    body_template TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.notification_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    template_code TEXT REFERENCES public.notification_templates(code) ON DELETE SET NULL,
    channel TEXT DEFAULT 'IN_APP' CHECK (channel IN ('IN_APP', 'EMAIL', 'SMS')),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SENT', 'FAILED')),
    retry_count INTEGER DEFAULT 0 NOT NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.notification_delivery_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    queue_id UUID REFERENCES public.notification_queue(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL,
    error_message TEXT,
    attempt_number INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ========================================================
-- ENABLE ROW LEVEL SECURITY (RLS) FOR ALL NEW TABLES
-- ========================================================
ALTER TABLE public.exam_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seat_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seat_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seat_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seat_allocation_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registration_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registration_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registration_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hall_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hall_ticket_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invigilator_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invigilator_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_result_publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_delivery_logs ENABLE ROW LEVEL SECURITY;

-- ========================================================
-- ADD RLS POLICIES FOR TENANT ISOLATION
-- ========================================================
DROP POLICY IF EXISTS "Tenant select centers" ON public.exam_centers;
CREATE POLICY "Tenant select centers" ON public.exam_centers FOR SELECT TO authenticated USING (school_id = public.get_my_school_id());
DROP POLICY IF EXISTS "Tenant manage centers" ON public.exam_centers;
CREATE POLICY "Tenant manage centers" ON public.exam_centers FOR ALL TO authenticated USING (school_id = public.get_my_school_id());

DROP POLICY IF EXISTS "Tenant select buildings" ON public.exam_buildings;
CREATE POLICY "Tenant select buildings" ON public.exam_buildings FOR SELECT TO authenticated USING (school_id = public.get_my_school_id());
DROP POLICY IF EXISTS "Tenant manage buildings" ON public.exam_buildings;
CREATE POLICY "Tenant manage buildings" ON public.exam_buildings FOR ALL TO authenticated USING (school_id = public.get_my_school_id());

DROP POLICY IF EXISTS "Tenant select rooms" ON public.exam_rooms;
CREATE POLICY "Tenant select rooms" ON public.exam_rooms FOR SELECT TO authenticated USING (school_id = public.get_my_school_id());
DROP POLICY IF EXISTS "Tenant manage rooms" ON public.exam_rooms;
CREATE POLICY "Tenant manage rooms" ON public.exam_rooms FOR ALL TO authenticated USING (school_id = public.get_my_school_id());

DROP POLICY IF EXISTS "Tenant select seat templates" ON public.seat_templates;
CREATE POLICY "Tenant select seat templates" ON public.seat_templates FOR SELECT TO authenticated USING (school_id = public.get_my_school_id());
DROP POLICY IF EXISTS "Tenant manage seat templates" ON public.seat_templates;
CREATE POLICY "Tenant manage seat templates" ON public.seat_templates FOR ALL TO authenticated USING (school_id = public.get_my_school_id());

DROP POLICY IF EXISTS "Tenant select seat layouts" ON public.seat_layouts;
CREATE POLICY "Tenant select seat layouts" ON public.seat_layouts FOR SELECT TO authenticated USING (school_id = public.get_my_school_id());
DROP POLICY IF EXISTS "Tenant manage seat layouts" ON public.seat_layouts;
CREATE POLICY "Tenant manage seat layouts" ON public.seat_layouts FOR ALL TO authenticated USING (school_id = public.get_my_school_id());

DROP POLICY IF EXISTS "Tenant select schedule sessions" ON public.schedule_sessions;
CREATE POLICY "Tenant select schedule sessions" ON public.schedule_sessions FOR SELECT TO authenticated USING (school_id = public.get_my_school_id());
DROP POLICY IF EXISTS "Tenant manage schedule sessions" ON public.schedule_sessions;
CREATE POLICY "Tenant manage schedule sessions" ON public.schedule_sessions FOR ALL TO authenticated USING (school_id = public.get_my_school_id());

DROP POLICY IF EXISTS "Tenant select schedule rooms" ON public.schedule_rooms;
CREATE POLICY "Tenant select schedule rooms" ON public.schedule_rooms FOR SELECT TO authenticated USING (school_id = public.get_my_school_id());
DROP POLICY IF EXISTS "Tenant manage schedule rooms" ON public.schedule_rooms;
CREATE POLICY "Tenant manage schedule rooms" ON public.schedule_rooms FOR ALL TO authenticated USING (school_id = public.get_my_school_id());

DROP POLICY IF EXISTS "Tenant select seat allocations" ON public.seat_allocations;
CREATE POLICY "Tenant select seat allocations" ON public.seat_allocations FOR SELECT TO authenticated USING (school_id = public.get_my_school_id());
DROP POLICY IF EXISTS "Tenant manage seat allocations" ON public.seat_allocations;
CREATE POLICY "Tenant manage seat allocations" ON public.seat_allocations FOR ALL TO authenticated USING (school_id = public.get_my_school_id());

DROP POLICY IF EXISTS "Tenant select seat logs" ON public.seat_allocation_audit_logs;
CREATE POLICY "Tenant select seat logs" ON public.seat_allocation_audit_logs FOR SELECT TO authenticated USING (school_id = public.get_my_school_id());
DROP POLICY IF EXISTS "Tenant manage seat logs" ON public.seat_allocation_audit_logs;
CREATE POLICY "Tenant manage seat logs" ON public.seat_allocation_audit_logs FOR ALL TO authenticated USING (school_id = public.get_my_school_id());

DROP POLICY IF EXISTS "Tenant select registrations" ON public.exam_registrations;
CREATE POLICY "Tenant select registrations" ON public.exam_registrations FOR SELECT TO authenticated USING (school_id = public.get_my_school_id());
DROP POLICY IF EXISTS "Tenant manage registrations" ON public.exam_registrations;
CREATE POLICY "Tenant manage registrations" ON public.exam_registrations FOR ALL TO authenticated USING (school_id = public.get_my_school_id());

DROP POLICY IF EXISTS "Tenant select reg history" ON public.registration_status_history;
CREATE POLICY "Tenant select reg history" ON public.registration_status_history FOR SELECT TO authenticated USING (school_id = public.get_my_school_id());
DROP POLICY IF EXISTS "Tenant manage reg history" ON public.registration_status_history;
CREATE POLICY "Tenant manage reg history" ON public.registration_status_history FOR ALL TO authenticated USING (school_id = public.get_my_school_id());

DROP POLICY IF EXISTS "Tenant select reg docs" ON public.registration_documents;
CREATE POLICY "Tenant select reg docs" ON public.registration_documents FOR SELECT TO authenticated USING (school_id = public.get_my_school_id());
DROP POLICY IF EXISTS "Tenant manage reg docs" ON public.registration_documents;
CREATE POLICY "Tenant manage reg docs" ON public.registration_documents FOR ALL TO authenticated USING (school_id = public.get_my_school_id());

DROP POLICY IF EXISTS "Tenant select reg logs" ON public.registration_logs;
CREATE POLICY "Tenant select reg logs" ON public.registration_logs FOR SELECT TO authenticated USING (school_id = public.get_my_school_id());
DROP POLICY IF EXISTS "Tenant manage reg logs" ON public.registration_logs;
CREATE POLICY "Tenant manage reg logs" ON public.registration_logs FOR ALL TO authenticated USING (school_id = public.get_my_school_id());

DROP POLICY IF EXISTS "Tenant select tickets" ON public.hall_tickets;
CREATE POLICY "Tenant select tickets" ON public.hall_tickets FOR SELECT TO authenticated USING (school_id = public.get_my_school_id());
DROP POLICY IF EXISTS "Tenant manage tickets" ON public.hall_tickets;
CREATE POLICY "Tenant manage tickets" ON public.hall_tickets FOR ALL TO authenticated USING (school_id = public.get_my_school_id());

DROP POLICY IF EXISTS "Tenant select ticket logs" ON public.hall_ticket_logs;
CREATE POLICY "Tenant select ticket logs" ON public.hall_ticket_logs FOR SELECT TO authenticated USING (school_id = public.get_my_school_id());
DROP POLICY IF EXISTS "Tenant manage ticket logs" ON public.hall_ticket_logs;
CREATE POLICY "Tenant manage ticket logs" ON public.hall_ticket_logs FOR ALL TO authenticated USING (school_id = public.get_my_school_id());

DROP POLICY IF EXISTS "Tenant select invig availability" ON public.invigilator_availability;
CREATE POLICY "Tenant select invig availability" ON public.invigilator_availability FOR SELECT TO authenticated USING (school_id = public.get_my_school_id());
DROP POLICY IF EXISTS "Tenant manage invig availability" ON public.invigilator_availability;
CREATE POLICY "Tenant manage invig availability" ON public.invigilator_availability FOR ALL TO authenticated USING (school_id = public.get_my_school_id());

DROP POLICY IF EXISTS "Tenant select invig assignments" ON public.invigilator_assignments;
CREATE POLICY "Tenant select invig assignments" ON public.invigilator_assignments FOR SELECT TO authenticated USING (school_id = public.get_my_school_id());
DROP POLICY IF EXISTS "Tenant manage invig assignments" ON public.invigilator_assignments;
CREATE POLICY "Tenant manage invig assignments" ON public.invigilator_assignments FOR ALL TO authenticated USING (school_id = public.get_my_school_id());

DROP POLICY IF EXISTS "Tenant select attendance" ON public.exam_attendance;
CREATE POLICY "Tenant select attendance" ON public.exam_attendance FOR SELECT TO authenticated USING (school_id = public.get_my_school_id());
DROP POLICY IF EXISTS "Tenant manage attendance" ON public.exam_attendance;
CREATE POLICY "Tenant manage attendance" ON public.exam_attendance FOR ALL TO authenticated USING (school_id = public.get_my_school_id());

DROP POLICY IF EXISTS "Tenant select attendance logs" ON public.attendance_logs;
CREATE POLICY "Tenant select attendance logs" ON public.attendance_logs FOR SELECT TO authenticated USING (school_id = public.get_my_school_id());
DROP POLICY IF EXISTS "Tenant manage attendance logs" ON public.attendance_logs;
CREATE POLICY "Tenant manage attendance logs" ON public.attendance_logs FOR ALL TO authenticated USING (school_id = public.get_my_school_id());

DROP POLICY IF EXISTS "Tenant select publications" ON public.exam_result_publications;
CREATE POLICY "Tenant select publications" ON public.exam_result_publications FOR SELECT TO authenticated USING (school_id = public.get_my_school_id());
DROP POLICY IF EXISTS "Tenant manage publications" ON public.exam_result_publications;
CREATE POLICY "Tenant manage publications" ON public.exam_result_publications FOR ALL TO authenticated USING (school_id = public.get_my_school_id());

DROP POLICY IF EXISTS "Tenant select approval history" ON public.approval_history;
CREATE POLICY "Tenant select approval history" ON public.approval_history FOR SELECT TO authenticated USING (school_id = public.get_my_school_id());
DROP POLICY IF EXISTS "Tenant manage approval history" ON public.approval_history;
CREATE POLICY "Tenant manage approval history" ON public.approval_history FOR ALL TO authenticated USING (school_id = public.get_my_school_id());

DROP POLICY IF EXISTS "Tenant select notification templates" ON public.notification_templates;
CREATE POLICY "Tenant select notification templates" ON public.notification_templates FOR SELECT TO authenticated USING (school_id = public.get_my_school_id());
DROP POLICY IF EXISTS "Tenant manage notification templates" ON public.notification_templates;
CREATE POLICY "Tenant manage notification templates" ON public.notification_templates FOR ALL TO authenticated USING (school_id = public.get_my_school_id());

DROP POLICY IF EXISTS "Tenant select notification queue" ON public.notification_queue;
CREATE POLICY "Tenant select notification queue" ON public.notification_queue FOR SELECT TO authenticated USING (school_id = public.get_my_school_id());
DROP POLICY IF EXISTS "Tenant manage notification queue" ON public.notification_queue;
CREATE POLICY "Tenant manage notification queue" ON public.notification_queue FOR ALL TO authenticated USING (school_id = public.get_my_school_id());

DROP POLICY IF EXISTS "Tenant select delivery logs" ON public.notification_delivery_logs;
CREATE POLICY "Tenant select delivery logs" ON public.notification_delivery_logs FOR SELECT TO authenticated USING (school_id = public.get_my_school_id());
DROP POLICY IF EXISTS "Tenant manage delivery logs" ON public.notification_delivery_logs;
CREATE POLICY "Tenant manage delivery logs" ON public.notification_delivery_logs FOR ALL TO authenticated USING (school_id = public.get_my_school_id());

COMMIT;
