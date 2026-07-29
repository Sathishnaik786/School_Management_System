-- Add password field to admissions table for account registration during approval
ALTER TABLE public.admissions ADD COLUMN IF NOT EXISTS parent_password TEXT;
ALTER TABLE public.admissions ALTER COLUMN applicant_user_id DROP NOT NULL;
