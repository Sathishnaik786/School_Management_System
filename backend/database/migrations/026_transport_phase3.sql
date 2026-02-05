-- Phase T3: Driver Operations & Events (Shadow Mode)

-- 1. Create BUS_DRIVER Role
INSERT INTO public.roles (name, description)
VALUES ('BUS_DRIVER', 'School Bus Driver')
ON CONFLICT (name) DO NOTHING;

-- 2. Define Permissions
-- TRIP_EXECUTE: Start/Stop trips, invalidating events
-- TRIP_VIEW_SELF: View assigned trips
-- TRIP_MONITOR: View all trips (Admin)
INSERT INTO public.permissions (code, description)
VALUES 
    ('TRIP_EXECUTE', 'can execute transport trips'),
    ('TRIP_VIEW_SELF', 'can view own trips'),
    ('TRIP_MONITOR', 'can monitor all trips')
ON CONFLICT (code) DO NOTHING;

-- 3. Grant Permissions
-- BUS_DRIVER -> TRIP_EXECUTE, TRIP_VIEW_SELF
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p
WHERE r.name = 'BUS_DRIVER' AND p.code IN ('TRIP_EXECUTE', 'TRIP_VIEW_SELF')
ON CONFLICT DO NOTHING;

-- ADMIN, TRANSPORT_ADMIN -> TRIP_MONITOR
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p
WHERE r.name IN ('ADMIN', 'TRANSPORT_ADMIN') AND p.code IN ('TRIP_MONITOR')
ON CONFLICT DO NOTHING;

-- 4. Create Trips Table
CREATE TABLE IF NOT EXISTS public.transport_trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) NOT NULL,
    route_id UUID REFERENCES public.transport_routes(id) NOT NULL,
    vehicle_id UUID REFERENCES public.transport_vehicles(id) NOT NULL,
    driver_id UUID REFERENCES public.transport_drivers(id) NOT NULL,
    trip_date DATE NOT NULL DEFAULT CURRENT_DATE,
    trip_type TEXT NOT NULL CHECK (trip_type IN ('MORNING', 'EVENING')),
    status TEXT NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED')),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Safety: One active trip per driver/vehicle constraint could be complex, 
    -- but we can enforce "One LISTED trip per Morning/Evening per Driver" via unique index?
    -- A driver usually does 1 morning trip and 1 evening trip.
    -- Let's just index for lookup speed.
    CONSTRAINT unique_driver_trip_schedule UNIQUE (driver_id, trip_date, trip_type)
);

-- 5. Create Trip Events Table (The Source of Truth)
CREATE TABLE IF NOT EXISTS public.transport_trip_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID REFERENCES public.transport_trips(id) ON DELETE CASCADE NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('TRIP_STARTED', 'STOP_REACHED', 'STUDENT_BOARDED', 'STUDENT_DROPPED', 'TRIP_COMPLETED')),
    stop_id UUID REFERENCES public.transport_stops(id), -- Nullable for Trip Start/End
    student_id UUID REFERENCES public.students(id),     -- Nullable for non-student events
    latitude NUMERIC,
    longitude NUMERIC,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID DEFAULT auth.uid() -- The driver user id
);

-- 6. RLS Policies
ALTER TABLE public.transport_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_trip_events ENABLE ROW LEVEL SECURITY;

-- Trips:
-- Admin/Monitor: View All
CREATE POLICY "Admins can view all trips" ON public.transport_trips
    FOR SELECT TO authenticated
    USING (
        public.is_admin() OR 
        public.has_permission('TRIP_MONITOR') OR 
        public.has_permission('TRANSPORT_VIEW') -- Legacy support
    );

-- Driver: View Own
CREATE POLICY "Drivers can view own trips" ON public.transport_trips
    FOR SELECT TO authenticated
    USING (
        driver_id IN (
            SELECT id FROM public.transport_drivers WHERE user_id = auth.uid()
        )
    );

-- Driver: Create/Update Own (Managed via backend mostly, but allowed if strictly RLS)
-- We will stick to backend logic for inserts to ensure safety, but SELECT is key.

-- Events:
-- Admin: View All
CREATE POLICY "Admins can view events" ON public.transport_trip_events
    FOR SELECT TO authenticated
    USING (
        public.is_admin() OR 
        public.has_permission('TRIP_MONITOR')
    );

-- Driver: Insert Events for Own Trips
CREATE POLICY "Drivers can insert events" ON public.transport_trip_events
    FOR INSERT TO authenticated
    WITH CHECK (
        trip_id IN (
            SELECT id FROM public.transport_trips 
            WHERE driver_id IN (SELECT id FROM public.transport_drivers WHERE user_id = auth.uid())
        )
    );
