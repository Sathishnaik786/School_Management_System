-- Phase 5: Ad-Hoc Transport Attendance (Additive Schema)
-- Description: Allows parents/admins to mark valid students as "Not Travelling" for specific days.
-- Non-breaking: Independent table; does not touch main Academic Attendance.

-- ==============================================
-- 1. SCHEMA: Transport Daily Attendance
-- ==============================================

CREATE TABLE IF NOT EXISTS public.student_transport_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Who and When
    student_id UUID NOT NULL,       -- Link to student (Validation in Service Layer)
    trip_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Status Flags
    pickup_disabled BOOLEAN DEFAULT FALSE, -- "Don't pick me up this morning"
    drop_disabled BOOLEAN DEFAULT FALSE,   -- "Don't drop me home this evening"
    
    -- Metadata
    reason TEXT,                    -- e.g., "Parent dropping personally", "Sick leave"
    marked_by UUID DEFAULT auth.uid(),
    marked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Soft Constraint (One record per student per day)
    -- Fixed Syntax Error from previous version
    CONSTRAINT unique_transport_attendance_day UNIQUE (student_id, trip_date)
);

-- Index for Manifest Filtering (Critical for Driver App speed)
CREATE INDEX IF NOT EXISTS idx_transport_attendance_filter 
    ON public.student_transport_attendance(trip_date, student_id);

-- ==============================================
-- 2. SECURITY: RLS Policies
-- ==============================================

ALTER TABLE public.student_transport_attendance ENABLE ROW LEVEL SECURITY;

-- 2.1 Transport Admin: Full Control
-- Drop policy first to avoid conflicts on re-run
DROP POLICY IF EXISTS "Admins manage transport attendance" ON public.student_transport_attendance;
CREATE POLICY "Admins manage transport attendance" ON public.student_transport_attendance
    FOR ALL
    USING (
        public.is_admin() OR 
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            JOIN public.roles r ON ur.role_id = r.id 
            WHERE ur.user_id = auth.uid() AND r.name = 'TRANSPORT_ADMIN'
        )
    );

-- 2.2 Parents: Manage OWN children only
DROP POLICY IF EXISTS "Parents manage own kids transport" ON public.student_transport_attendance;
CREATE POLICY "Parents manage own kids transport" ON public.student_transport_attendance
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.student_parents sp 
            WHERE sp.student_id = student_transport_attendance.student_id 
            AND sp.parent_user_id = auth.uid()
        )
    );

-- 2.3 Drivers: Read-Only (For Manifest)
DROP POLICY IF EXISTS "Drivers view transport attendance" ON public.student_transport_attendance;
CREATE POLICY "Drivers view transport attendance" ON public.student_transport_attendance
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.transport_drivers td
            WHERE td.user_id = auth.uid()
            -- Driver can view only for TODAY (Performance optimization optional here)
        )
    );
