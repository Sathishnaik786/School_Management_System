-- Phase T8: Crisis-Response & Exception Management

-- 1. Extend Event Types and Add Narrative Message Column
ALTER TABLE public.transport_trip_events 
DROP CONSTRAINT IF EXISTS transport_trip_events_event_type_check;

ALTER TABLE public.transport_trip_events
ADD CONSTRAINT transport_trip_events_event_type_check 
CHECK (event_type IN (
    'TRIP_STARTED', 
    'STOP_REACHED', 
    'STUDENT_BOARDED', 
    'STUDENT_DROPPED', 
    'TRIP_COMPLETED',
    'TRIP_DELAYED',
    'VEHICLE_BREAKDOWN',
    'DRIVER_CHANGED',
    'ROUTE_MODIFIED',
    'SUBSTITUTE_VEHICLE_ASSIGNED'
));

ALTER TABLE public.transport_trip_events
ADD COLUMN IF NOT EXISTS message TEXT;

-- 2. RLS Update for Admins to Insert Exceptions
-- Drivers can only insert basic ops events, Admins can insert exceptions
CREATE POLICY "Admins can insert exception events" ON public.transport_trip_events
    FOR INSERT TO authenticated
    WITH CHECK (
        public.is_admin() OR 
        public.has_permission('TRIP_MONITOR')
    );
