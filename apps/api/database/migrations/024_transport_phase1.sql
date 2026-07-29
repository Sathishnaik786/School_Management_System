-- Phase T1: Transport Data Truthfulness

-- 1. Create Stops Table
CREATE TABLE IF NOT EXISTS public.transport_stops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Drivers Table
CREATE TABLE IF NOT EXISTS public.transport_drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE, -- Must be a valid user
    license_number TEXT,
    phone TEXT,
    status TEXT CHECK (status IN ('ACTIVE', 'INACTIVE')) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Route Stops (Linking Routes to Stops)
CREATE TABLE IF NOT EXISTS public.transport_route_stops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID REFERENCES public.transport_routes(id) ON DELETE CASCADE NOT NULL,
    stop_id UUID REFERENCES public.transport_stops(id) ON DELETE CASCADE NOT NULL,
    stop_order INTEGER NOT NULL CHECK (stop_order > 0),
    morning_time TIME,
    evening_time TIME,
    
    UNIQUE(route_id, stop_order),
    UNIQUE(route_id, stop_id)
);

-- 4. Re-create Student Assignment Table
DROP TABLE IF EXISTS public.student_transport; -- Drop prototype table

CREATE TABLE IF NOT EXISTS public.transport_student_assignment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    route_id UUID REFERENCES public.transport_routes(id) ON DELETE CASCADE NOT NULL,
    stop_id UUID REFERENCES public.transport_stops(id) ON DELETE CASCADE NOT NULL,
    pickup_mode TEXT CHECK (pickup_mode IN ('PICKUP', 'DROP', 'BOTH')) DEFAULT 'BOTH',
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(student_id)
);

-- Enable RLS
ALTER TABLE public.transport_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_route_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_student_assignment ENABLE ROW LEVEL SECURITY;

-- Policies

-- Stops
CREATE POLICY "School View Stops" ON public.transport_stops 
    FOR SELECT USING (school_id = public.get_my_school_id());

CREATE POLICY "Admin Manage Stops" ON public.transport_stops 
    FOR ALL USING (school_id = public.get_my_school_id() AND public.can_manage_transport());

-- Drivers
CREATE POLICY "School View Drivers" ON public.transport_drivers 
    FOR SELECT USING (school_id = public.get_my_school_id());

CREATE POLICY "Admin Manage Drivers" ON public.transport_drivers 
    FOR ALL USING (school_id = public.get_my_school_id() AND public.can_manage_transport());

-- Route Stops
CREATE POLICY "School View Route Stops" ON public.transport_route_stops 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.transport_routes r 
            WHERE r.id = transport_route_stops.route_id 
            AND r.school_id = public.get_my_school_id()
        )
    );

CREATE POLICY "Admin Manage Route Stops" ON public.transport_route_stops 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.transport_routes r 
            WHERE r.id = transport_route_stops.route_id 
            AND r.school_id = public.get_my_school_id()
        )
        AND public.can_manage_transport()
    );

-- Student Assignment
CREATE POLICY "School View Assignments" ON public.transport_student_assignment 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.students s 
            WHERE s.id = transport_student_assignment.student_id 
            AND s.school_id = public.get_my_school_id()
        )
    );

CREATE POLICY "Admin Manage Assignments" ON public.transport_student_assignment 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.students s 
            WHERE s.id = transport_student_assignment.student_id 
            AND s.school_id = public.get_my_school_id()
        )
        AND public.can_manage_transport()
    );

-- Parent/Student View (Restricted Logic)
-- They can only see their own assignment
CREATE POLICY "Student View Own Assignment" ON public.transport_student_assignment
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.students s
            WHERE s.id = transport_student_assignment.student_id
            AND (
                s.admission_id IN (SELECT id FROM public.admissions WHERE applicant_user_id = auth.uid()) OR
                EXISTS (SELECT 1 FROM public.student_parents sp WHERE sp.student_id = s.id AND sp.parent_user_id = auth.uid())
            )
        )
    );
