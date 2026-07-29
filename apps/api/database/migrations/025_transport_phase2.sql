-- Phase T2: Transport Admin & Scheduling

-- 1. Create TRANSPORT_ADMIN Role
INSERT INTO public.roles (name, description)
VALUES ('TRANSPORT_ADMIN', 'Manage Transport Operations')
ON CONFLICT (name) DO NOTHING;

-- 2. Grant Permissions to TRANSPORT_ADMIN
-- Ensure they can Manage Transport and View Students (for assignment)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r, public.permissions p
WHERE r.name = 'TRANSPORT_ADMIN'
AND p.code IN ('TRANSPORT_SETUP', 'TRANSPORT_ASSIGN', 'TRANSPORT_VIEW', 'STUDENT_VIEW')
ON CONFLICT DO NOTHING;

-- 3. Enhance Route Vehicles (Scheduling)
ALTER TABLE public.route_vehicles
ADD COLUMN IF NOT EXISTS driver_id UUID REFERENCES public.transport_drivers(id);

-- 4. Helper View for Route Capacity & Stats
-- Allows easy querying of "How many students on this route?" and "What is total capacity?"
CREATE OR REPLACE VIEW public.transport_route_stats AS
SELECT 
    r.id AS route_id,
    r.school_id,
    r.name,
    -- Capacity: Sum of all vehicles assigned to this route
    COALESCE(SUM(v.capacity), 0) AS total_capacity,
    -- Assigned: Count of students assigned to this route
    (
        SELECT COUNT(*) 
        FROM public.transport_student_assignment tsa 
        WHERE tsa.route_id = r.id
    ) AS assigned_count
FROM public.transport_routes r
LEFT JOIN public.route_vehicles rv ON r.id = rv.route_id
LEFT JOIN public.transport_vehicles v ON rv.vehicle_id = v.id
GROUP BY r.id, r.school_id, r.name;

-- 5. Helper Function to Check Capacity
-- Returns TRUE if adding N students would exceed capacity
CREATE OR REPLACE FUNCTION public.check_transport_capacity(check_route_id UUID, new_count INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    current_assigned INTEGER;
    max_cap INTEGER;
BEGIN
    SELECT assigned_count, total_capacity 
    INTO current_assigned, max_cap
    FROM public.transport_route_stats
    WHERE route_id = check_route_id;
    
    IF (current_assigned + new_count) > max_cap THEN
        RETURN FALSE;
    ELSE
        RETURN TRUE;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
