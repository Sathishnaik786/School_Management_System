-- Phase T7: Transport Analytics & Operational Insights

-- 1. View: Route Delay Summary (Average and Max delays per route)
CREATE OR REPLACE VIEW public.transport_trip_delay_summary AS
SELECT 
    t.school_id,
    t.route_id,
    r.name as route_name,
    AVG(EXTRACT(EPOCH FROM (te.timestamp::time - 
        CASE 
            WHEN t.trip_type = 'MORNING' THEN rs.morning_time 
            ELSE rs.evening_time 
        END
    )) / 60) as avg_delay_minutes,
    MAX(EXTRACT(EPOCH FROM (te.timestamp::time - 
        CASE 
            WHEN t.trip_type = 'MORNING' THEN rs.morning_time 
            ELSE rs.evening_time 
        END
    )) / 60) as max_delay_minutes
FROM public.transport_trip_events te
JOIN public.transport_trips t ON te.trip_id = t.id
JOIN public.transport_routes r ON t.route_id = r.id
JOIN public.transport_route_stops rs ON t.route_id = rs.route_id AND te.stop_id = rs.stop_id
WHERE te.event_type = 'STOP_REACHED'
GROUP BY t.school_id, t.route_id, r.name;

-- 2. View: Route On-Time Stats (Punctuality percentage)
CREATE OR REPLACE VIEW public.transport_route_on_time_stats AS
WITH trip_delays AS (
    SELECT 
        te.trip_id,
        t.route_id,
        t.trip_type,
        t.school_id,
        AVG(EXTRACT(EPOCH FROM (te.timestamp::time - 
            CASE 
                WHEN t.trip_type = 'MORNING' THEN rs.morning_time 
                ELSE rs.evening_time 
            END
        )) / 60) as avg_trip_delay
    FROM public.transport_trip_events te
    JOIN public.transport_trips t ON te.trip_id = t.id
    JOIN public.transport_route_stops rs ON t.route_id = rs.route_id AND te.stop_id = rs.stop_id
    WHERE te.event_type = 'STOP_REACHED'
    GROUP BY te.trip_id, t.route_id, t.trip_type, t.school_id
),
trip_status AS (
    SELECT 
        route_id,
        trip_type,
        school_id,
        CASE WHEN avg_trip_delay <= 10 THEN 1 ELSE 0 END as is_on_time
    FROM trip_delays
)
SELECT 
    ts.school_id,
    ts.route_id,
    r.name as route_name,
    ts.trip_type,
    COUNT(*) as total_trips,
    SUM(ts.is_on_time) as on_time_trips,
    ROUND((SUM(ts.is_on_time)::numeric / COUNT(*)) * 100, 2) as on_time_percentage
FROM trip_status ts
JOIN public.transport_routes r ON ts.route_id = r.id
GROUP BY ts.school_id, ts.route_id, r.name, ts.trip_type;

-- 3. View: Student Pickup Accuracy (Missed pickups tracking)
CREATE OR REPLACE VIEW public.transport_student_pickup_accuracy AS
SELECT 
    tsa.student_id,
    s.full_name as student_name,
    s.school_id,
    COUNT(DISTINCT t.id) as total_trips,
    COUNT(DISTINCT te.id) FILTER (WHERE te.event_type = 'STUDENT_BOARDED') as boarded_count,
    COUNT(DISTINCT t.id) - COUNT(DISTINCT te.id) FILTER (WHERE te.event_type = 'STUDENT_BOARDED') as missed_pickups
FROM public.transport_student_assignment tsa
JOIN public.students s ON tsa.student_id = s.id
JOIN public.transport_trips t ON tsa.route_id = t.route_id AND t.status = 'COMPLETED'
LEFT JOIN public.transport_trip_events te ON t.id = te.trip_id AND te.student_id = tsa.student_id
GROUP BY tsa.student_id, s.full_name, s.school_id;

-- RLS for Views (Essential for security)
-- Note: Supabase RLS works on Views if the underlying tables have RLS, 
-- but explicitly defining security definer helpers or policies is safer.
-- Since these are read-only views for specific roles, we'll ensure the API filters by school_id.
