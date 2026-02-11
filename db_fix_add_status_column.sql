-- Add 'status' column to exams table if it doesn't exist
ALTER TABLE exams 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'DRAFT';

-- Add 'type' column just in case it is also missing (as it is used in the code)
ALTER TABLE exams 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'GENERAL';
