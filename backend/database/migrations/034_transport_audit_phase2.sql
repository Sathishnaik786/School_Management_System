-- Phase 2: Transport Configuration Audit Logging (Additive Schema)
-- Description: Introduces non-blocking audit logging for transport configuration changes.
-- Non-breaking: No Foreign Keys. Triggers are exception-safe.

-- ==============================================
-- 1. SCHEMA: Audit Log Table
-- ==============================================

CREATE TABLE IF NOT EXISTS public.transport_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Target Details
    entity_type TEXT NOT NULL, -- e.g., 'transport_routes', 'transport_vehicles'
    entity_id UUID NOT NULL,   -- No FK constraint to preserve logs after deletion
    
    -- Change Details
    action TEXT NOT NULL,      -- 'INSERT', 'UPDATE', 'DELETE'
    old_data JSONB,            -- Snapshot before change
    new_data JSONB,            -- Snapshot after change
    
    -- Metadata
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    changed_by UUID DEFAULT auth.uid() -- Captures the user modifying the data
);

-- Index for fast history lookup
CREATE INDEX IF NOT EXISTS idx_transport_audit_entity 
    ON public.transport_audit_logs(entity_type, entity_id);

-- Index for timeline analysis
CREATE INDEX IF NOT EXISTS idx_transport_audit_date 
    ON public.transport_audit_logs(changed_at);

-- ==============================================
-- 2. SECURITY: Policies
-- ==============================================

ALTER TABLE public.transport_audit_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view audit logs
CREATE POLICY "Admins view transport audits" ON public.transport_audit_logs
    FOR SELECT
    USING (
        public.is_admin() OR 
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            JOIN public.roles r ON ur.role_id = r.id 
            WHERE ur.user_id = auth.uid() AND r.name = 'TRANSPORT_ADMIN'
        )
    );

-- No public insert/update/delete policies needed as triggers will use SECURITY DEFINER

-- ==============================================
-- 3. FUNCTIONS: Audit Trigger Logic
-- ==============================================

CREATE OR REPLACE FUNCTION public.log_transport_audit()
RETURNS TRIGGER AS $$
DECLARE
    v_old_data JSONB;
    v_new_data JSONB;
    v_entity_id UUID;
BEGIN
    -- 1. Determine payloads
    IF (TG_OP = 'INSERT') THEN
        v_new_data = to_jsonb(NEW);
        v_entity_id = NEW.id;
    ELSIF (TG_OP = 'UPDATE') THEN
        v_old_data = to_jsonb(OLD);
        v_new_data = to_jsonb(NEW);
        v_entity_id = NEW.id;
    ELSIF (TG_OP = 'DELETE') THEN
        v_old_data = to_jsonb(OLD);
        v_entity_id = OLD.id;
    END IF;

    -- 2. Attempt Log Insertion (Exception Safe)
    BEGIN
        INSERT INTO public.transport_audit_logs (
            entity_type,
            entity_id,
            action,
            old_data,
            new_data,
            changed_by
        ) VALUES (
            TG_TABLE_NAME::TEXT,
            v_entity_id,
            TG_OP,
            v_old_data,
            v_new_data,
            auth.uid()
        );
    EXCEPTION WHEN OTHERS THEN
        -- Swallow error to ensure main transaction never fails
        -- In valid production logs, we might log this to console, 
        -- but here we just ensure flow continuity.
        RAISE WARNING 'Transport Audit Log Failed: %', SQLERRM;
    END;

    RETURN NULL; -- AFTER trigger ignores return value
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 
-- SECURITY DEFINER ensures the trigger runs with owner privileges, 
-- bypassing RLS checks on the audit table itself.

-- ==============================================
-- 4. ATTACHMENT: Triggers
-- ==============================================

-- 4.1 Transport Routes
DROP TRIGGER IF EXISTS audit_transport_routes ON public.transport_routes;
CREATE TRIGGER audit_transport_routes
    AFTER INSERT OR UPDATE OR DELETE ON public.transport_routes
    FOR EACH ROW EXECUTE FUNCTION public.log_transport_audit();

-- 4.2 Transport Route Stops (Junction Table)
DROP TRIGGER IF EXISTS audit_transport_route_stops ON public.transport_route_stops;
CREATE TRIGGER audit_transport_route_stops
    AFTER INSERT OR UPDATE OR DELETE ON public.transport_route_stops
    FOR EACH ROW EXECUTE FUNCTION public.log_transport_audit();

-- 4.3 Transport Vehicles
DROP TRIGGER IF EXISTS audit_transport_vehicles ON public.transport_vehicles;
CREATE TRIGGER audit_transport_vehicles
    AFTER INSERT OR UPDATE OR DELETE ON public.transport_vehicles
    FOR EACH ROW EXECUTE FUNCTION public.log_transport_audit();

-- 4.4 Transport Drivers (Extra Safety)
DROP TRIGGER IF EXISTS audit_transport_drivers ON public.transport_drivers;
CREATE TRIGGER audit_transport_drivers
    AFTER INSERT OR UPDATE OR DELETE ON public.transport_drivers
    FOR EACH ROW EXECUTE FUNCTION public.log_transport_audit();
