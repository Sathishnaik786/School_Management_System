-- Up Migration

-- Ensure UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Ensure 050 tables exist (Self-healing if 050 failed)
CREATE TABLE IF NOT EXISTS grading_scales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL,
    min_score NUMERIC NOT NULL,
    max_score NUMERIC NOT NULL,
    grade_label TEXT NOT NULL,
    grade_point NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT grade_range_check CHECK (min_score <= max_score)
);

CREATE TABLE IF NOT EXISTS student_result_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    total_obtained NUMERIC DEFAULT 0,
    total_max NUMERIC DEFAULT 0,
    percentage NUMERIC DEFAULT 0,
    grade TEXT,
    result_status TEXT CHECK (result_status IN ('PASS', 'FAIL')),
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_exam_student_result UNIQUE (exam_id, student_id)
);

-- 2. Apply 051 Changes (Columns) safely
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_result_summaries' AND column_name = 'published_at') THEN
        ALTER TABLE student_result_summaries ADD COLUMN published_at TIMESTAMP WITH TIME ZONE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_result_summaries' AND column_name = 'published_by') THEN
        ALTER TABLE student_result_summaries ADD COLUMN published_by UUID;
    END IF;
END $$;

-- 3. Create Audit Logs Table
CREATE TABLE IF NOT EXISTS exam_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type TEXT NOT NULL,
    entity_id UUID,
    action TEXT NOT NULL,
    performed_by UUID,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Down Migration
DROP TABLE IF EXISTS exam_audit_logs;
-- We don't drop columns in down migration to be safe usually, or we can.
-- Check context.
