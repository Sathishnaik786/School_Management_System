-- Up Migration
CREATE TABLE exam_halls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL,
    hall_name TEXT NOT NULL,
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE exam_seating_allocations (
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
