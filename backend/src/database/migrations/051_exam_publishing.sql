-- Up Migration
ALTER TABLE student_result_summaries
ADD COLUMN published_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN published_by UUID; -- references auth.users or faculty, usually uuid of user

CREATE TABLE exam_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type TEXT NOT NULL, -- 'MARK', 'RESULT', 'SCHEDULE'
    entity_id UUID, -- ID of the modified entity
    action TEXT NOT NULL, -- 'PUBLISH', 'LOCK', 'UPDATE_ATTEMPT'
    performed_by UUID, -- User ID
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Down Migration
DROP TABLE IF EXISTS exam_audit_logs;
ALTER TABLE student_result_summaries
DROP COLUMN published_at,
DROP COLUMN published_by;
