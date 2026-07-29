-- Phase T5: Live Location Tracking (Ephemeral)

-- 1. Location Table
-- Designed for high-frequency writes, short retention.
CREATE TABLE IF NOT EXISTS public.transport_trip_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID REFERENCES public.transport_trips(id) ON DELETE CASCADE NOT NULL,
    latitude NUMERIC NOT NULL,
    longitude NUMERIC NOT NULL,
    heading NUMERIC, -- Direction in degrees, useful for map rotation
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Optimize for fetching the "latest" ping per trip
CREATE INDEX idx_trip_locations_latest ON public.transport_trip_locations(trip_id, recorded_at DESC);

-- 2. RLS Policies
ALTER TABLE public.transport_trip_locations ENABLE ROW LEVEL SECURITY;

-- Admins: View All
CREATE POLICY "Admins can view trip locations" ON public.transport_trip_locations
    FOR SELECT TO authenticated
    USING (
        public.is_admin() OR 
        public.has_permission('TRIP_MONITOR')
    );

-- Drivers: Insert for Own Trips
CREATE POLICY "Drivers can insert location" ON public.transport_trip_locations
    FOR INSERT TO authenticated
    WITH CHECK (
        trip_id IN (
            SELECT id FROM public.transport_trips 
            WHERE driver_id IN (SELECT id FROM public.transport_drivers WHERE user_id = auth.uid())
            AND status = 'LIVE'
        )
    );

-- Parents:
-- RLS for parents is complex (join 4 tables). 
-- We will handle Parent Access Control strictly in the Backend API Layer (GET /my/tracking)
-- to ensure performance and strict privacy validation.

-- 3. Cleanup Function (Ephemeral Data)
-- Ideally runs on a schedule (pg_cron) or lazily.
-- For now, we define a function admins can call or we assume external cleanup.
CREATE OR REPLACE FUNCTION public.cleanup_old_trip_locations()
RETURNS void AS $$
BEGIN
    DELETE FROM public.transport_trip_locations
    WHERE recorded_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;
