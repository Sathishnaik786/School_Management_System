-- 039_import_system_phase1.sql
-- Create table for tracking import jobs

CREATE TABLE IF NOT EXISTS public.import_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    
    entity_type TEXT NOT NULL CHECK (entity_type IN ('STUDENT', 'FACULTY', 'DRIVER', 'VEHICLE')),
    file_name TEXT,
    
    status TEXT CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')) DEFAULT 'PENDING',
    
    total_rows INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    
    -- Storing simple JSON array of failed rows { row, error, data }
    failed_rows JSONB DEFAULT '[]'::jsonb,
    
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE public.import_jobs ENABLE ROW LEVEL SECURITY;

-- Only Admins can view/manage import jobs for their school
CREATE POLICY "Admin manage import jobs" ON public.import_jobs
    FOR ALL USING (
        school_id = public.get_my_school_id() 
        AND public.is_admin()
    );

-- Indexes
CREATE INDEX idx_import_jobs_school ON public.import_jobs(school_id);
