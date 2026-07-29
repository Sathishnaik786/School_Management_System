
BEGIN;

-- 1. Enhance exam_halls with grid support
ALTER TABLE public.exam_halls 
ADD COLUMN IF NOT EXISTS rows_count INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS cols_count INTEGER DEFAULT 5;

-- 2. Enhance exams with seating status
ALTER TABLE public.exams 
ADD COLUMN IF NOT EXISTS seating_status TEXT CHECK (seating_status IN ('DRAFT', 'PUBLISHED')) DEFAULT 'DRAFT';

-- 3. Update exam_seating_allocations to support Exam-scoped seating
-- We'll allow linking directly to an exam for a fixed seat across all schedules.
ALTER TABLE public.exam_seating_allocations 
ADD COLUMN IF NOT EXISTS exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE;

-- If we want one seat per exam, we need a unique constraint on (exam_id, student_id)
-- First, clean up any existing that might conflict? (Assuming it's safe to drop or it's a new system)
-- Actually, let's just add the constraint.
ALTER TABLE public.exam_seating_allocations
DROP CONSTRAINT IF EXISTS unique_student_exam_seat,
ADD CONSTRAINT unique_student_exam_seat UNIQUE (exam_id, student_id);

-- Optional: If we still want per-schedule seating, we keep exam_schedule_id. 
-- But user asked for "student_id, exam_id, hall_id, seat_number" in their prompt point C.3.

-- 4. Create Hall Tickets Table
CREATE TABLE IF NOT EXISTS public.exam_hall_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
    
    ticket_code TEXT UNIQUE NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT CHECK (status IN ('GENERATED', 'DOWNLOADED', 'REVOKED')) DEFAULT 'GENERATED',
    
    -- Store snapshots of data at time of generation for security/integrity
    snapshot_data JSONB, 
    
    UNIQUE (student_id, exam_id)
);

-- Indexing
CREATE INDEX IF NOT EXISTS idx_hall_tickets_exam ON public.exam_hall_tickets(exam_id);
CREATE INDEX IF NOT EXISTS idx_hall_tickets_student ON public.exam_hall_tickets(student_id);

COMMIT;
