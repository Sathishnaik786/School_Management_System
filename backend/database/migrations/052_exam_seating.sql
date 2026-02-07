-- Up Migration
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. REPAIR: Ensure exam_schedules exists (Critical dependency)
CREATE TABLE IF NOT EXISTS exam_schedules (
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

-- 2. Create Seating Tables
CREATE TABLE IF NOT EXISTS exam_halls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL,
    hall_name TEXT NOT NULL,
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exam_seating_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_schedule_id UUID NOT NULL REFERENCES exam_schedules(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    hall_id UUID NOT NULL REFERENCES exam_halls(id) ON DELETE CASCADE,
    seat_number TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_student_schedule_seat UNIQUE (exam_schedule_id, student_id),
    CONSTRAINT unique_hall_seat_schedule UNIQUE (exam_schedule_id, hall_id, seat_number)
);

-- Down Migration
DROP TABLE IF EXISTS exam_seating_allocations;
DROP TABLE IF EXISTS exam_halls;
