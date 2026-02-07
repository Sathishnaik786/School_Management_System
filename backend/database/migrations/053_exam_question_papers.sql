-- Up Migration
CREATE TABLE exam_question_papers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_schedule_id UUID NOT NULL REFERENCES exam_schedules(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL, -- references auth.users
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    version INTEGER DEFAULT 1,
    status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'FINAL', 'LOCKED')),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    locked_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT unique_schedule_version UNIQUE (exam_schedule_id, version)
);

-- Down Migration
DROP TABLE IF EXISTS exam_question_papers;
