-- ====================================================
-- MIGRATION: 125_examination_administration_schema
-- DESCRIPTION: Adds Examination Calendar domain tables, constraints, RLS, and audit triggers.
-- ====================================================

BEGIN;

-- ====================================================
-- 1. ENUM for conflict severity
-- ====================================================
CREATE TYPE public.conflict_severity AS ENUM ('INFO', 'WARNING', 'ERROR', 'CRITICAL');

-- ====================================================
-- 2. TABLE: academic_calendars
-- ====================================================
CREATE TABLE IF NOT EXISTS public.academic_calendars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID,
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,
    CONSTRAINT chk_academic_dates CHECK (end_date >= start_date),
    CONSTRAINT uq_academic_calendar_name UNIQUE (school_id, name)
);
-- Indexes
CREATE INDEX IF NOT EXISTS idx_academic_calendars_school_id ON public.academic_calendars(school_id);
CREATE INDEX IF NOT EXISTS idx_academic_calendars_dates ON public.academic_calendars(start_date, end_date);
-- FK to schools (assumes schools table exists)
ALTER TABLE public.academic_calendars
    ADD CONSTRAINT fk_academic_calendars_school FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE RESTRICT;

-- ====================================================
-- 3. TABLE: academic_calendar_events
-- ====================================================
CREATE TABLE IF NOT EXISTS public.academic_calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    calendar_id UUID NOT NULL,
    event_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    location TEXT,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID,
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,
    CONSTRAINT uq_event_per_calendar UNIQUE (calendar_id, title, event_date)
);
-- Indexes
CREATE INDEX IF NOT EXISTS idx_academic_calendar_events_calendar_id ON public.academic_calendar_events(calendar_id);
CREATE INDEX IF NOT EXISTS idx_academic_calendar_events_date ON public.academic_calendar_events(event_date);
-- FK
ALTER TABLE public.academic_calendar_events
    ADD CONSTRAINT fk_academic_calendar_events_calendar FOREIGN KEY (calendar_id) REFERENCES public.academic_calendars(id) ON DELETE CASCADE;

-- ====================================================
-- 4. TABLE: exam_calendars
-- ====================================================
CREATE TABLE IF NOT EXISTS public.exam_calendars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL,
    exam_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID,
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,
    CONSTRAINT uq_exam_calendar_name UNIQUE (school_id, exam_id, name)
);
CREATE INDEX IF NOT EXISTS idx_exam_calendars_school_id ON public.exam_calendars(school_id);
CREATE INDEX IF NOT EXISTS idx_exam_calendars_exam_id ON public.exam_calendars(exam_id);
ALTER TABLE public.exam_calendars
    ADD CONSTRAINT fk_exam_calendars_school FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE RESTRICT,
    ADD CONSTRAINT fk_exam_calendars_exam FOREIGN KEY (exam_id) REFERENCES public.exams(id) ON DELETE CASCADE;

-- ====================================================
-- 5. TABLE: exam_schedule_versions (immutable snapshots)
-- ====================================================
CREATE TABLE IF NOT EXISTS public.exam_schedule_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_calendar_id UUID NOT NULL,
    version_number INTEGER NOT NULL,
    snapshot JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID,
    CONSTRAINT uq_exam_schedule_version UNIQUE (exam_calendar_id, version_number)
);
CREATE INDEX IF NOT EXISTS idx_exam_schedule_versions_calendar_id ON public.exam_schedule_versions(exam_calendar_id);
ALTER TABLE public.exam_schedule_versions
    ADD CONSTRAINT fk_exam_schedule_versions_calendar FOREIGN KEY (exam_calendar_id) REFERENCES public.exam_calendars(id) ON DELETE CASCADE;

-- ====================================================
-- 6. TABLE: room_calendars
-- ====================================================
CREATE TABLE IF NOT EXISTS public.room_calendars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL,
    room_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID,
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,
    CONSTRAINT uq_room_calendar UNIQUE (school_id, room_id, name)
);
CREATE INDEX IF NOT EXISTS idx_room_calendars_school_id ON public.room_calendars(school_id);
CREATE INDEX IF NOT EXISTS idx_room_calendars_room_id ON public.room_calendars(room_id);
ALTER TABLE public.room_calendars
    ADD CONSTRAINT fk_room_calendars_school FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE RESTRICT,
    ADD CONSTRAINT fk_room_calendars_room FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE RESTRICT;

-- ====================================================
-- 7. TABLE: invigilator_calendars
-- ====================================================
CREATE TABLE IF NOT EXISTS public.invigilator_calendars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL,
    staff_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID,
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,
    CONSTRAINT uq_invigilator_calendar UNIQUE (school_id, staff_id, name)
);
CREATE INDEX IF NOT EXISTS idx_invigilator_calendars_school_id ON public.invigilator_calendars(school_id);
CREATE INDEX IF NOT EXISTS idx_invigilator_calendars_staff_id ON public.invigilator_calendars(staff_id);
ALTER TABLE public.invigilator_calendars
    ADD CONSTRAINT fk_invigilator_calendars_school FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE RESTRICT,
    ADD CONSTRAINT fk_invigilator_calendars_staff FOREIGN KEY (staff_id) REFERENCES public.staff(id) ON DELETE RESTRICT;

-- ====================================================
-- 8. TABLE: calendar_publications
-- ====================================================
CREATE TABLE IF NOT EXISTS public.calendar_publications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    calendar_type TEXT NOT NULL, -- e.g., 'academic', 'exam', 'room', 'invigilator'
    calendar_id UUID NOT NULL,
    version_number INTEGER NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    published_by UUID NOT NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID,
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,
    CONSTRAINT uq_calendar_publication UNIQUE (calendar_type, calendar_id, version_number)
);
CREATE INDEX IF NOT EXISTS idx_calendar_publications_type_id ON public.calendar_publications(calendar_type, calendar_id);
-- Note: FK to specific calendar tables is enforced at application level.

-- ====================================================
-- 9. TABLE: calendar_conflicts
-- ====================================================
CREATE TABLE IF NOT EXISTS public.calendar_conflicts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    calendar_id UUID NOT NULL,
    conflicting_calendar_id UUID NOT NULL,
    severity public.conflict_severity NOT NULL,
    description TEXT,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID,
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,
    CONSTRAINT uq_conflict_pair UNIQUE (calendar_id, conflicting_calendar_id)
);
CREATE INDEX IF NOT EXISTS idx_calendar_conflicts_calendar_id ON public.calendar_conflicts(calendar_id);
CREATE INDEX IF NOT EXISTS idx_calendar_conflicts_conflicting_id ON public.calendar_conflicts(conflicting_calendar_id);
ALTER TABLE public.calendar_conflicts
    ADD CONSTRAINT fk_calendar_conflicts_calendar FOREIGN KEY (calendar_id) REFERENCES public.academic_calendars(id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_calendar_conflicts_conflicting_calendar FOREIGN KEY (conflicting_calendar_id) REFERENCES public.academic_calendars(id) ON DELETE CASCADE;

-- ====================================================
-- 10. TABLE: calendar_audit_logs
-- ====================================================
CREATE TABLE IF NOT EXISTS public.calendar_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    calendar_id UUID NOT NULL,
    action TEXT NOT NULL, -- INSERT, UPDATE, DELETE
    old_data JSONB,
    new_data JSONB,
    performed_by UUID NOT NULL,
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    entity_type TEXT NOT NULL,
    entity_name TEXT NOT NULL,
    module TEXT NOT NULL,
    reason TEXT,
    trace_id UUID,
    session_id UUID,
    ip_address INET,
    user_agent TEXT,
    tenant_id UUID
);
CREATE INDEX IF NOT EXISTS idx_calendar_audit_logs_calendar_id ON public.calendar_audit_logs(calendar_id);
ALTER TABLE public.calendar_audit_logs
    ADD CONSTRAINT fk_calendar_audit_logs_calendar FOREIGN KEY (calendar_id) REFERENCES public.academic_calendars(id) ON DELETE CASCADE;

-- ====================================================
-- 11. ROW LEVEL SECURITY (RLS) and Policies
-- ====================================================
DO $$
BEGIN
    -- academic_calendars
    ALTER TABLE public.academic_calendars ENABLE ROW LEVEL SECURITY;
    CREATE POLICY academic_calendars_select ON public.academic_calendars
        FOR SELECT USING (
            has_permission(get_current_user_id(), 'exam.admin.calendar.view') AND school_id = get_current_school_id()
        );
    CREATE POLICY academic_calendars_insert ON public.academic_calendars
        FOR INSERT WITH CHECK (
            has_permission(get_current_user_id(), 'exam.admin.calendar.manage') AND school_id = get_current_school_id()
        );
    CREATE POLICY academic_calendars_update ON public.academic_calendars
        FOR UPDATE USING (
            has_permission(get_current_user_id(), 'exam.admin.calendar.manage') AND school_id = get_current_school_id()
        ) WITH CHECK (
            has_permission(get_current_user_id(), 'exam.admin.calendar.manage') AND school_id = get_current_school_id()
        );
    CREATE POLICY academic_calendars_delete ON public.academic_calendars
        FOR DELETE USING (
            has_permission(get_current_user_id(), 'exam.admin.calendar.manage') AND school_id = get_current_school_id()
        );

    -- academic_calendar_events
    ALTER TABLE public.academic_calendar_events ENABLE ROW LEVEL SECURITY;
    CREATE POLICY academic_calendar_events_select ON public.academic_calendar_events
        FOR SELECT USING (
            has_permission(get_current_user_id(), 'exam.admin.calendar.view') AND calendar_id IN (SELECT id FROM public.academic_calendars WHERE school_id = get_current_school_id())
        );
    CREATE POLICY academic_calendar_events_insert ON public.academic_calendar_events
        FOR INSERT WITH CHECK (
            has_permission(get_current_user_id(), 'exam.admin.calendar.manage') AND calendar_id IN (SELECT id FROM public.academic_calendars WHERE school_id = get_current_school_id())
        );
    CREATE POLICY academic_calendar_events_update ON public.academic_calendar_events
        FOR UPDATE USING (
            has_permission(get_current_user_id(), 'exam.admin.calendar.manage') AND calendar_id IN (SELECT id FROM public.academic_calendars WHERE school_id = get_current_school_id())
        ) WITH CHECK (
            has_permission(get_current_user_id(), 'exam.admin.calendar.manage') AND calendar_id IN (SELECT id FROM public.academic_calendars WHERE school_id = get_current_school_id())
        );
    CREATE POLICY academic_calendar_events_delete ON public.academic_calendar_events
        FOR DELETE USING (
            has_permission(get_current_user_id(), 'exam.admin.calendar.manage') AND calendar_id IN (SELECT id FROM public.academic_calendars WHERE school_id = get_current_school_id())
        );

    -- exam_calendars
    ALTER TABLE public.exam_calendars ENABLE ROW LEVEL SECURITY;
    CREATE POLICY exam_calendars_select ON public.exam_calendars
        FOR SELECT USING (
            has_permission(get_current_user_id(), 'exam.admin.calendar.view') AND school_id = get_current_school_id()
        );
    CREATE POLICY exam_calendars_insert ON public.exam_calendars
        FOR INSERT WITH CHECK (
            has_permission(get_current_user_id(), 'exam.admin.calendar.manage') AND school_id = get_current_school_id()
        );
    CREATE POLICY exam_calendars_update ON public.exam_calendars
        FOR UPDATE USING (
            has_permission(get_current_user_id(), 'exam.admin.calendar.manage') AND school_id = get_current_school_id()
        ) WITH CHECK (
            has_permission(get_current_user_id(), 'exam.admin.calendar.manage') AND school_id = get_current_school_id()
        );
    CREATE POLICY exam_calendars_delete ON public.exam_calendars
        FOR DELETE USING (
            has_permission(get_current_user_id(), 'exam.admin.calendar.manage') AND school_id = get_current_school_id()
        );

    -- exam_schedule_versions (read‑only for normal users, only privileged service may insert)
    ALTER TABLE public.exam_schedule_versions ENABLE ROW LEVEL SECURITY;
    CREATE POLICY exam_schedule_versions_select ON public.exam_schedule_versions
        FOR SELECT USING (
            has_permission(get_current_user_id(), 'exam.admin.calendar.view')
        );
    CREATE POLICY exam_schedule_versions_insert ON public.exam_schedule_versions
        FOR INSERT WITH CHECK (
            has_permission(get_current_user_id(), 'exam.admin.calendar.manage')
        );

    -- room_calendars
    ALTER TABLE public.room_calendars ENABLE ROW LEVEL SECURITY;
    CREATE POLICY room_calendars_select ON public.room_calendars
        FOR SELECT USING (
            has_permission(get_current_user_id(), 'exam.admin.calendar.view') AND school_id = get_current_school_id()
        );
    CREATE POLICY room_calendars_insert ON public.room_calendars
        FOR INSERT WITH CHECK (
            has_permission(get_current_user_id(), 'exam.admin.calendar.manage') AND school_id = get_current_school_id()
        );
    CREATE POLICY room_calendars_update ON public.room_calendars
        FOR UPDATE USING (
            has_permission(get_current_user_id(), 'exam.admin.calendar.manage') AND school_id = get_current_school_id()
        ) WITH CHECK (
            has_permission(get_current_user_id(), 'exam.admin.calendar.manage') AND school_id = get_current_school_id()
        );
    CREATE POLICY room_calendars_delete ON public.room_calendars
        FOR DELETE USING (
            has_permission(get_current_user_id(), 'exam.admin.calendar.manage') AND school_id = get_current_school_id()
        );

    -- invigilator_calendars
    ALTER TABLE public.invigilator_calendars ENABLE ROW LEVEL SECURITY;
    CREATE POLICY invigilator_calendars_select ON public.invigilator_calendars
        FOR SELECT USING (
            has_permission(get_current_user_id(), 'exam.admin.calendar.view') AND school_id = get_current_school_id()
        );
    CREATE POLICY invigilator_calendars_insert ON public.invigilator_calendars
        FOR INSERT WITH CHECK (
            has_permission(get_current_user_id(), 'exam.admin.calendar.manage') AND school_id = get_current_school_id()
        );
    CREATE POLICY invigilator_calendars_update ON public.invigilator_calendars
        FOR UPDATE USING (
            has_permission(get_current_user_id(), 'exam.admin.calendar.manage') AND school_id = get_current_school_id()
        ) WITH CHECK (
            has_permission(get_current_user_id(), 'exam.admin.calendar.manage') AND school_id = get_current_school_id()
        );
    CREATE POLICY invigilator_calendars_delete ON public.invigilator_calendars
        FOR DELETE USING (
            has_permission(get_current_user_id(), 'exam.admin.calendar.manage') AND school_id = get_current_school_id()
        );

    -- calendar_publications
    ALTER TABLE public.calendar_publications ENABLE ROW LEVEL SECURITY;
    CREATE POLICY calendar_publications_select ON public.calendar_publications
        FOR SELECT USING (
            has_permission(get_current_user_id(), 'exam.admin.calendar.view')
        );
    CREATE POLICY calendar_publications_insert ON public.calendar_publications
        FOR INSERT WITH CHECK (
            has_permission(get_current_user_id(), 'exam.admin.calendar.manage')
        );
    CREATE POLICY calendar_publications_update ON public.calendar_publications
        FOR UPDATE USING (
            has_permission(get_current_user_id(), 'exam.admin.calendar.manage')
        ) WITH CHECK (
            has_permission(get_current_user_id(), 'exam.admin.calendar.manage')
        );
    CREATE POLICY calendar_publications_delete ON public.calendar_publications
        FOR DELETE USING (
            has_permission(get_current_user_id(), 'exam.admin.calendar.manage')
        );

    -- calendar_conflicts
    ALTER TABLE public.calendar_conflicts ENABLE ROW LEVEL SECURITY;
    CREATE POLICY calendar_conflicts_select ON public.calendar_conflicts
        FOR SELECT USING (
            has_permission(get_current_user_id(), 'exam.admin.calendar.view')
        );
    CREATE POLICY calendar_conflicts_insert ON public.calendar_conflicts
        FOR INSERT WITH CHECK (
            has_permission(get_current_user_id(), 'exam.admin.calendar.manage')
        );
    CREATE POLICY calendar_conflicts_update ON public.calendar_conflicts
        FOR UPDATE USING (
            has_permission(get_current_user_id(), 'exam.admin.calendar.manage')
        ) WITH CHECK (
            has_permission(get_current_user_id(), 'exam.admin.calendar.manage')
        );
    CREATE POLICY calendar_conflicts_delete ON public.calendar_conflicts
        FOR DELETE USING (
            has_permission(get_current_user_id(), 'exam.admin.calendar.manage')
        );
END $$;

-- ====================================================
-- 12. AUDIT TRIGGER FUNCTION (generic for all calendar tables)
-- ====================================================
CREATE OR REPLACE FUNCTION public.fn_audit_calendar_changes() RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID := get_current_user_id();
    v_action TEXT;
    v_old JSONB;
    v_new JSONB;
BEGIN
    IF TG_OP = 'INSERT' THEN
        v_action := 'INSERT';
        v_new := to_jsonb(NEW);
    ELSIF TG_OP = 'UPDATE' THEN
        v_action := 'UPDATE';
        v_old := to_jsonb(OLD);
        v_new := to_jsonb(NEW);
    ELSIF TG_OP = 'DELETE' THEN
        v_action := 'DELETE';
        v_old := to_jsonb(OLD);
    END IF;

    INSERT INTO public.calendar_audit_logs(
        calendar_id,
        action,
        old_data,
        new_data,
        performed_by,
        performed_at
    ) VALUES (
        COALESCE(NEW.id, OLD.id),
        v_action,
        v_old,
        v_new,
        v_user_id,
        now()
    );
    RETURN NULL; -- AFTER trigger, result is ignored
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to each calendar table (excluding audit log table itself)
DO $$
BEGIN
    -- academic_calendars
    CREATE TRIGGER trg_audit_academic_calendars AFTER INSERT OR UPDATE OR DELETE ON public.academic_calendars
        FOR EACH ROW EXECUTE FUNCTION public.fn_audit_calendar_changes();
    -- academic_calendar_events
    CREATE TRIGGER trg_audit_academic_calendar_events AFTER INSERT OR UPDATE OR DELETE ON public.academic_calendar_events
        FOR EACH ROW EXECUTE FUNCTION public.fn_audit_calendar_changes();
    -- exam_calendars
    CREATE TRIGGER trg_audit_exam_calendars AFTER INSERT OR UPDATE OR DELETE ON public.exam_calendars
        FOR EACH ROW EXECUTE FUNCTION public.fn_audit_calendar_changes();
    -- room_calendars
    CREATE TRIGGER trg_audit_room_calendars AFTER INSERT OR UPDATE OR DELETE ON public.room_calendars
        FOR EACH ROW EXECUTE FUNCTION public.fn_audit_calendar_changes();
    -- invigilator_calendars
    CREATE TRIGGER trg_audit_invigilator_calendars AFTER INSERT OR UPDATE OR DELETE ON public.invigilator_calendars
        FOR EACH ROW EXECUTE FUNCTION public.fn_audit_calendar_changes();
    -- calendar_publications
    CREATE TRIGGER trg_audit_calendar_publications AFTER INSERT OR UPDATE OR DELETE ON public.calendar_publications
        FOR EACH ROW EXECUTE FUNCTION public.fn_audit_calendar_changes();
    -- calendar_conflicts
    CREATE TRIGGER trg_audit_calendar_conflicts AFTER INSERT OR UPDATE OR DELETE ON public.calendar_conflicts
        FOR EACH ROW EXECUTE FUNCTION public.fn_audit_calendar_changes();
END $$;

/* Enterprise refinements */

-- 1. Add lifecycle status to exam_calendars
ALTER TABLE public.exam_calendars
  ADD COLUMN status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','UNDER_REVIEW','APPROVED','PUBLISHED','LOCKED','ARCHIVED'));

-- 2. Extend exam_schedule_versions with publishing metadata and status
ALTER TABLE public.exam_schedule_versions
  ADD COLUMN published_by UUID,
  ADD COLUMN published_at TIMESTAMPTZ,
  ADD COLUMN status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','PUBLISHED','SUPERSEDED','ARCHIVED'));

-- 3. Enhance calendar_conflicts with rule metadata and resolution tracking
ALTER TABLE public.calendar_conflicts
  ADD COLUMN rule_code TEXT NOT NULL,
  ADD COLUMN severity TEXT NOT NULL CHECK (severity IN ('INFO','WARNING','ERROR','CRITICAL')),
  ADD COLUMN resolved_by UUID,
  ADD COLUMN resolved_at TIMESTAMPTZ,
  ADD COLUMN resolution_notes TEXT;

-- 4. Extend calendar_audit_logs with compliance fields
ALTER TABLE public.calendar_audit_logs
  ADD COLUMN ip_address INET,
  ADD COLUMN user_agent TEXT,
  ADD COLUMN reason TEXT;

-- 5. Add deleted_reason to soft‑delete tables
ALTER TABLE public.academic_calendars ADD COLUMN deleted_reason TEXT;
ALTER TABLE public.academic_calendar_events ADD COLUMN deleted_reason TEXT;
ALTER TABLE public.exam_calendars ADD COLUMN deleted_reason TEXT;
ALTER TABLE public.exam_schedule_versions ADD COLUMN deleted_reason TEXT;
ALTER TABLE public.room_calendars ADD COLUMN deleted_reason TEXT;
ALTER TABLE public.invigilator_calendars ADD COLUMN deleted_reason TEXT;
ALTER TABLE public.calendar_publications ADD COLUMN deleted_reason TEXT;
ALTER TABLE public.calendar_conflicts ADD COLUMN deleted_reason TEXT;

-- 6. Composite index for efficient conflict detection on academic calendars
CREATE INDEX IF NOT EXISTS idx_academic_calendars_school_dates ON public.academic_calendars(school_id, start_date, end_date);

COMMIT;
