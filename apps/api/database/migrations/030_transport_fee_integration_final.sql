-- Phase T6: Transport & Fees Financial Integration

-- 1. Table: Transport Fee Slabs (Stop-to-Price Mapping)
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

-- 2. Audit & Type Columns for Student Fees (Enhancing existing table)
ALTER TABLE public.student_fees 
ADD COLUMN IF NOT EXISTS fee_type TEXT DEFAULT 'OTHER',
ADD COLUMN IF NOT EXISTS reference_id UUID, -- Links to transport_fee_slabs.id or others
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'UNPAID';

-- 3. Trigger for Auto-Fee Creation
CREATE OR REPLACE FUNCTION public.auto_create_transport_fee()
RETURNS TRIGGER AS $$
DECLARE
    slab_record RECORD;
    ay_id UUID;
    sch_id UUID;
    existing_fee UUID;
    fs_id UUID;
    stop_name TEXT;
BEGIN
    -- 1. Get School Context
    SELECT school_id INTO sch_id FROM public.transport_routes WHERE id = NEW.route_id;
    
    -- 2. Get Active Academic Year
    -- We assume the assignment belongs to the current active year.
    SELECT id INTO ay_id FROM public.academic_years WHERE school_id = sch_id AND is_active = true LIMIT 1;
    
    -- 3. Lookup Transport Fee Slab
    SELECT * INTO slab_record FROM public.transport_fee_slabs 
    WHERE stop_id = NEW.stop_id AND academic_year_id = ay_id;

    -- 4. If Slab exists, proceed to fee creation
    IF slab_record.id IS NOT NULL THEN
        
        -- Rule 3: Enforce Idempotency (Student + Year + Type)
        -- Check if a TRANSPORT fee already exists for this student in this year
        -- We join with fee_structures to verify the year
        SELECT sf.id INTO existing_fee
        FROM public.student_fees sf
        JOIN public.fee_structures fs ON sf.fee_structure_id = fs.id
        WHERE sf.student_id = NEW.student_id 
        AND sf.fee_type = 'TRANSPORT'
        AND fs.academic_year_id = ay_id;

        IF existing_fee IS NULL THEN
            -- Get Stop Name for labeling
            SELECT name INTO stop_name FROM public.transport_stops WHERE id = NEW.stop_id;

            -- 5. Ensure a "Transport" Fee Structure exists (or create/find generic one)
            -- We create one per stop for high clarity in ledger
            INSERT INTO public.fee_structures (school_id, academic_year_id, name, amount, fee_details)
            VALUES (sch_id, ay_id, 'Transport Fee: ' || stop_name, slab_record.amount, 'Transport charges for stop ' || stop_name)
            ON CONFLICT (school_id, academic_year_id, name) DO UPDATE SET amount = EXCLUDED.amount
            RETURNING id INTO fs_id;

            -- 6. Create Student Fee Record
            INSERT INTO public.student_fees (
                student_id, 
                fee_structure_id, 
                assigned_amount, 
                fee_type, 
                reference_id, 
                status
            )
            VALUES (
                NEW.student_id, 
                fs_id, 
                slab_record.amount, 
                'TRANSPORT', 
                slab_record.id, 
                'UNPAID'
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop if exists to avoid errors on re-run
DROP TRIGGER IF EXISTS trigger_auto_transport_fee ON public.transport_student_assignment;

CREATE TRIGGER trigger_auto_transport_fee
AFTER INSERT OR UPDATE OF stop_id ON public.transport_student_assignment
FOR EACH ROW EXECUTE FUNCTION public.auto_create_transport_fee();

-- 4. RLS for Fee Slabs
ALTER TABLE public.transport_fee_slabs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage transport fee slabs" ON public.transport_fee_slabs
    FOR ALL USING (
        school_id = public.get_my_school_id() 
        AND (public.is_admin() OR EXISTS (
            SELECT 1 FROM public.user_roles ur 
            JOIN public.roles r ON ur.role_id = r.id 
            WHERE ur.user_id = auth.uid() AND r.name IN ('ADMIN', 'TRANSPORT_ADMIN')
        ))
    );

CREATE POLICY "Users view transport fee slabs" ON public.transport_fee_slabs
    FOR SELECT USING (school_id = public.get_my_school_id());
