-- Up Migration
CREATE TABLE exam_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    exam_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    max_marks NUMERIC DEFAULT 100,
    passing_marks NUMERIC DEFAULT 35,
    status TEXT DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'COMPLETED', 'CANCELLED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_exam_subject_schedule UNIQUE (exam_id, subject_id),
    CONSTRAINT check_time_order CHECK (end_time > start_time)
);

-- Down Migration
DROP TABLE IF EXISTS exam_schedules;
