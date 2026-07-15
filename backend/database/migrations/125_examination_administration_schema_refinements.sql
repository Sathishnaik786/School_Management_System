-- 125_examination_administration_schema_refinements.sql
-- Refinements per EARB review

-- 1. Fine-grained permission model (no direct impact on schema, but documentation)
--   Permissions to be added to RBAC tables elsewhere:
--     exam.admin.calendar.view
--     exam.admin.calendar.create
--     exam.admin.calendar.update
--     exam.admin.calendar.delete
--     exam.admin.calendar.publish
--     exam.admin.calendar.lock
--     exam.admin.calendar.version.view
--     exam.admin.calendar.version.restore
--     exam.admin.calendar.conflicts.view
--     exam.admin.calendar.conflicts.resolve
--     exam.admin.calendar.audit.view

-- 2. Add lifecycle status to calendars
ALTER TABLE exam_calendars
  ADD COLUMN status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','UNDER_REVIEW','APPROVED','PUBLISHED','LOCKED','ARCHIVED'));

-- 3. Extend exam_schedule_versions with publishing metadata and status
ALTER TABLE exam_schedule_versions
  ADD COLUMN published_by UUID,
  ADD COLUMN published_at TIMESTAMPTZ,
  ADD COLUMN status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','PUBLISHED','SUPERSEDED','ARCHIVED'));

-- 4. Enhance calendar_conflicts
ALTER TABLE calendar_conflicts
  ADD COLUMN rule_code TEXT NOT NULL,
  ADD COLUMN severity TEXT NOT NULL CHECK (severity IN ('INFO','WARNING','ERROR','CRITICAL')),
  ADD COLUMN resolved_by UUID,
  ADD COLUMN resolved_at TIMESTAMPTZ,
  ADD COLUMN resolution_notes TEXT;

-- 5. Extend audit logs with compliance fields
ALTER TABLE calendar_audit_logs
  ADD COLUMN ip_address INET,
  ADD COLUMN user_agent TEXT,
  ADD COLUMN reason TEXT;

-- 6. Soft‑delete enrichment: reason for deletion
-- Add to all tables that have soft‑delete triggers
ALTER TABLE academic_calendars ADD COLUMN deleted_reason TEXT;
ALTER TABLE academic_calendar_events ADD COLUMN deleted_reason TEXT;
ALTER TABLE exam_calendars ADD COLUMN deleted_reason TEXT;
ALTER TABLE exam_schedule_versions ADD COLUMN deleted_reason TEXT;
ALTER TABLE room_calendars ADD COLUMN deleted_reason TEXT;
ALTER TABLE invigilator_calendars ADD COLUMN deleted_reason TEXT;
ALTER TABLE calendar_publications ADD COLUMN deleted_reason TEXT;
ALTER TABLE calendar_conflicts ADD COLUMN deleted_reason TEXT;

-- 7. Composite index for efficient conflict detection (school, date range)
CREATE INDEX idx_academic_calendars_school_dates ON academic_calendars(school_id, start_date, end_date);

-- 8. Event placeholders (comments for future event bus integration)
--   calendar.created, calendar.updated, calendar.published, calendar.locked, calendar.archived

-- End of refinements
