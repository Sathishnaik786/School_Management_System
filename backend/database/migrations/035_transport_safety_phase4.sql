-- Phase 4: Driver Pre-Trip Safety Checklist (Additive Schema)
-- Description: Introduces vehicle readiness checks before trips.
-- Non-breaking: No Foreign Keys. Independent transaction log.

-- ==============================================
-- 1. SCHEMA: Vehicle Safety Checks
-- ==============================================

CREATE TABLE IF NOT EXISTS public.transport_vehicle_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Context
    trip_id UUID NOT NULL,     -- Logical link to the trip (Managed by App Logic)
    vehicle_id UUID NOT NULL,  -- Identifying the bus
    driver_id UUID NOT NULL,   -- Identifying who checked it
    
    -- Checklist Items (Boolean Intent)
    fuel_level TEXT CHECK (fuel_level IN ('FULL', 'HALF', 'LOW', 'RESERVE')), 
    tyres_ok BOOLEAN DEFAULT FALSE,
    brakes_ok BOOLEAN DEFAULT FALSE,
    lights_ok BOOLEAN DEFAULT FALSE,
    cleanliness_ok BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    remarks TEXT,
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for trip validation lookup (Fast)
CREATE INDEX IF NOT EXISTS idx_transport_checks_trip 
    ON public.transport_vehicle_checks(trip_id);

-- Index for vehicle history (Maintenance audit)
CREATE INDEX IF NOT EXISTS idx_transport_checks_vehicle 
    ON public.transport_vehicle_checks(vehicle_id, checked_at DESC);

-- ==============================================
-- 2. SECURITY: RLS Policies
-- ==============================================

ALTER TABLE public.transport_vehicle_checks ENABLE ROW LEVEL SECURITY;

-- Policy: Admin View All
CREATE POLICY "Admins view transport checks" ON public.transport_vehicle_checks
    FOR SELECT
    USING (
        public.is_admin() OR 
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            JOIN public.roles r ON ur.role_id = r.id 
            WHERE ur.user_id = auth.uid() AND r.name = 'TRANSPORT_ADMIN'
        )
    );

-- Policy: Drivers Insert Own Checks
CREATE POLICY "Drivers submit transport checks" ON public.transport_vehicle_checks
    FOR INSERT
    WITH CHECK (
        -- Simple check: User claims to be the driver_id?
        -- For strictness we could join transport_drivers but let's keep it light for high-throughput
        EXISTS (
             SELECT 1 FROM public.transport_drivers 
             WHERE id = transport_vehicle_checks.driver_id 
             AND user_id = auth.uid()
        )
    );

-- Policy: Drivers View Own Checks (for History)
CREATE POLICY "Drivers view own transport checks" ON public.transport_vehicle_checks
    FOR SELECT
    USING (
        EXISTS (
             SELECT 1 FROM public.transport_drivers 
             WHERE id = transport_vehicle_checks.driver_id 
             AND user_id = auth.uid()
        )
    );
