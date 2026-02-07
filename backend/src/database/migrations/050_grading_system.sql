-- Up Migration
CREATE TABLE grading_scales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL, -- references schools(id) usually, but we keep loose coupling if needed or strict if schema allows
    min_score NUMERIC NOT NULL,
    max_score NUMERIC NOT NULL,
    grade_label TEXT NOT NULL,
    grade_point NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT grade_range_check CHECK (min_score <= max_score)
);

CREATE TABLE student_result_summaries (
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

-- Down Migration
DROP TABLE IF EXISTS student_result_summaries;
DROP TABLE IF EXISTS grading_scales;
