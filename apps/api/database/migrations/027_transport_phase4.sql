-- Phase T4: Parent Visibility & Notifications

-- 1. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    channel TEXT NOT NULL DEFAULT 'IN_APP', -- IN_APP, SMS, PUSH
    is_read BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- 2. Transport Timeline View
-- This view flattens events for easy consumption by the frontend timeline
CREATE OR REPLACE VIEW public.transport_student_timeline AS
SELECT 
    e.id AS event_id,
    e.trip_id,
    t.route_id,
    
    -- The student this line item applies to:
    tsa.student_id,
    
    t.trip_date,
    t.trip_type,
    e.event_type,
    e.timestamp,
    
    -- Human Readable Message Construction
    CASE 
        WHEN e.event_type = 'TRIP_STARTED' THEN 
             CASE WHEN t.trip_type = 'MORNING' THEN '🚌 Bus has started for school'
                  ELSE '🚌 Bus has left school' END
        WHEN e.event_type = 'STUDENT_BOARDED' THEN 
             CASE WHEN t.trip_type = 'MORNING' THEN '✅ Boarded the bus'
                  ELSE '✅ Boarded bus from school' END
        WHEN e.event_type = 'STUDENT_DROPPED' THEN 
             CASE WHEN t.trip_type = 'MORNING' THEN '🏫 Reached School' 
                  ELSE '🏠 Reached Home' END
        ELSE e.event_type
    END AS message,

    -- Metadata for UI
    s.name AS stop_name

FROM public.transport_trip_events e
JOIN public.transport_trips t ON e.trip_id = t.id
JOIN public.transport_student_assignment tsa ON t.route_id = tsa.route_id
LEFT JOIN public.transport_stops s ON e.stop_id = s.id

WHERE 
    -- Filtering Rules:
    -- 1. TRIP_STARTED is visible to ALL students on the route
    (e.event_type = 'TRIP_STARTED')
    OR
    -- 2. Personal Events are visible ONLY to the specific student
    (e.event_type IN ('STUDENT_BOARDED', 'STUDENT_DROPPED') AND e.student_id = tsa.student_id)
    
    -- Note: STOP_REACHED is intentionally hidden from timeline to reduce noise
    -- Note: TRIP_COMPLETED is hidden (Admin only)
;

-- 3. Notification Permissions
-- Allow drivers (and system) to insert notifications? 
-- Usually backend service role handles this. 
-- Parents read only.

-- Grant access
GRANT SELECT ON public.transport_student_timeline TO authenticated;
GRANT SELECT, UPDATE ON public.notifications TO authenticated;
