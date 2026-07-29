-- 040_import_system_fix_constraints.sql
-- Fix entity_type check constraint and RLS policy for transport admins

-- 1. Drop existing check constraint
ALTER TABLE public.import_jobs DROP CONSTRAINT IF EXISTS import_jobs_entity_type_check;

-- 2. Add corrected check constraint including DRIVER_VEHICLE_MAP
ALTER TABLE public.import_jobs ADD CONSTRAINT import_jobs_entity_type_check 
    CHECK (entity_type IN ('STUDENT', 'FACULTY', 'DRIVER', 'VEHICLE', 'DRIVER_VEHICLE_MAP'));

-- 3. Update RLS Policy to allow TRANSPORT_ADMIN and HEAD_OF_INSTITUTE
DROP POLICY IF EXISTS "Admin manage import jobs" ON public.import_jobs;

DROP POLICY IF EXISTS "Authorized manage import jobs" ON public.import_jobs;
CREATE POLICY "Authorized manage import jobs" ON public.import_jobs
    FOR ALL USING (
        school_id = (SELECT school_id FROM public.users WHERE id = auth.uid())
        AND (
            EXISTS (
                SELECT 1 FROM public.user_roles ur
                JOIN public.roles r ON ur.role_id = r.id
                WHERE ur.user_id = auth.uid()
                AND r.name IN ('ADMIN', 'TRANSPORT_ADMIN', 'HEAD_OF_INSTITUTE')
            )
        )
    );
