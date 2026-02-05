-- ==========================================
-- 1. TABLES
-- ==========================================

-- ROUTES (e.g. "Route 1 - North Zone")
CREATE TABLE IF NOT EXISTS public.transport_routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE (school_id, name)
);

-- VEHICLES (e.g. "KA-01-AB-1234")
CREATE TABLE IF NOT EXISTS public.transport_vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    vehicle_no TEXT NOT NULL,
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE (school_id, vehicle_no)
);

-- ROUTE_VEHICLES (Linking Logic)
CREATE TABLE IF NOT EXISTS public.route_vehicles (
    route_id UUID REFERENCES public.transport_routes(id) ON DELETE CASCADE NOT NULL,
    vehicle_id UUID REFERENCES public.transport_vehicles(id) ON DELETE CASCADE NOT NULL,
    
    PRIMARY KEY (route_id, vehicle_id)
);

-- STUDENT_TRANSPORT (Assignments)
CREATE TABLE IF NOT EXISTS public.student_transport (
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE PRIMARY KEY, -- One route per student
    route_id UUID REFERENCES public.transport_routes(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 2. RLS POLICIES
-- ==========================================

ALTER TABLE public.transport_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_transport ENABLE ROW LEVEL SECURITY;

-- HELPER
CREATE OR REPLACE FUNCTION public.can_manage_transport()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role_id = rp.role_id
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = auth.uid()
    AND p.code IN ('TRANSPORT_SETUP', 'TRANSPORT_ASSIGN')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ROUTES
CREATE POLICY "School users view routes" ON public.transport_routes
    FOR SELECT USING (school_id = public.get_my_school_id());

CREATE POLICY "Admin manage routes" ON public.transport_routes
    FOR ALL USING (
        school_id = public.get_my_school_id() AND public.can_manage_transport()
    );

-- VEHICLES
CREATE POLICY "School users view vehicles" ON public.transport_vehicles
    FOR SELECT USING (school_id = public.get_my_school_id());

CREATE POLICY "Admin manage vehicles" ON public.transport_vehicles
    FOR ALL USING (
        school_id = public.get_my_school_id() AND public.can_manage_transport()
    );

-- ROUTE_VEHICLES
CREATE POLICY "School users view route_vehicles" ON public.route_vehicles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.transport_routes r
            WHERE r.id = public.route_vehicles.route_id
            AND r.school_id = public.get_my_school_id()
        )
    );

CREATE POLICY "Admin manage route_vehicles" ON public.route_vehicles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.transport_routes r
            WHERE r.id = public.route_vehicles.route_id
            AND r.school_id = public.get_my_school_id()
            AND public.can_manage_transport()
        )
    );

-- STUDENT_TRANSPORT
-- View: Staff + Self
CREATE POLICY "Staff view student transport" ON public.student_transport
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.students s
            WHERE s.id = public.student_transport.student_id
            AND s.school_id = public.get_my_school_id()
        )
    );

CREATE POLICY "Student view own transport" ON public.student_transport
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.students s
            WHERE s.id = public.student_transport.student_id
            AND (
                s.admission_id IN (SELECT id FROM public.admissions WHERE applicant_user_id = auth.uid()) OR
                EXISTS (SELECT 1 FROM public.student_parents sp WHERE sp.student_id = s.id AND sp.parent_user_id = auth.uid())
            )
        )
    );

-- Manage: Admin
CREATE POLICY "Admin manage student transport" ON public.student_transport
    FOR ALL USING (
         EXISTS (
            SELECT 1 FROM public.students s
            WHERE s.id = public.student_transport.student_id
            AND s.school_id = public.get_my_school_id()
            AND public.can_manage_transport()
        )
    );
