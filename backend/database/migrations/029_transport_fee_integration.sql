-- Phase T6: Fees Integration

-- 1. Fee Slabs Table
CREATE TABLE IF NOT EXISTS public.transport_fee_slabs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
    stop_id UUID REFERENCES public.transport_stops(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    currency TEXT DEFAULT 'INR',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(academic_year_id, stop_id)
);

-- 2. Enable RLS
ALTER TABLE public.transport_fee_slabs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage fee slabs" ON public.transport_fee_slabs
    FOR ALL USING (
        school_id = public.get_my_school_id() AND 
        (public.is_admin() OR public.has_permission('TRANSPORT_SETUP'))
    );

CREATE POLICY "Users view fee slabs" ON public.transport_fee_slabs
    FOR SELECT USING (school_id = public.get_my_school_id());

-- 3. Trigger for Auto Fee Assignment
-- When a student is assigned a stop, we create/update the transport fee for them.

CREATE OR REPLACE FUNCTION public.sync_transport_fees()
RETURNS TRIGGER AS $$
DECLARE
    slab_amount NUMERIC;
    ay_id UUID;
    fs_id UUID;
    sch_id UUID;
    stop_name TEXT;
BEGIN
    -- 1. Get School ID
    SELECT school_id INTO sch_id FROM public.transport_routes WHERE id = NEW.route_id;
    
    -- 2. Get Active Academic Year
    SELECT id INTO ay_id FROM public.academic_years WHERE school_id = sch_id AND is_active = true LIMIT 1;
    
    -- 3. Get Stop Name
    SELECT name INTO stop_name FROM public.transport_stops WHERE id = NEW.stop_id;

    -- 4. Get Slab Amount
    SELECT amount INTO slab_amount FROM public.transport_fee_slabs 
    WHERE stop_id = NEW.stop_id AND academic_year_id = ay_id;

    IF slab_amount IS NOT NULL THEN
        -- 5. Ensure Fee Structure exists
        INSERT INTO public.fee_structures (school_id, academic_year_id, name, amount)
        VALUES (sch_id, ay_id, 'Transport Fee: ' || stop_name, slab_amount)
        ON CONFLICT (school_id, academic_year_id, name) DO UPDATE SET amount = EXCLUDED.amount
        RETURNING id INTO fs_id;

        -- 6. Assign Fee to Student
        INSERT INTO public.student_fees (student_id, fee_structure_id, assigned_amount)
        VALUES (NEW.student_id, fs_id, slab_amount)
        ON CONFLICT (student_id, fee_structure_id) DO UPDATE SET assigned_amount = EXCLUDED.assigned_amount;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_transport_fee_sync
AFTER INSERT OR UPDATE ON public.transport_student_assignment
FOR EACH ROW EXECUTE FUNCTION public.sync_transport_fees();
