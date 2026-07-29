-- ==========================================
-- 1. TABLES
-- ==========================================

-- FEE STRUCTURES (Standard definitions per year/school)
CREATE TABLE IF NOT EXISTS public.fee_structures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL, -- e.g. "Tuition Fee Grade 1", "Transport Zone A"
    amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE (school_id, academic_year_id, name)
);

-- STUDENT FEES (Actual billable items assigned to a student)
CREATE TABLE IF NOT EXISTS public.student_fees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    fee_structure_id UUID REFERENCES public.fee_structures(id) ON DELETE CASCADE NOT NULL,
    assigned_amount NUMERIC(10, 2) NOT NULL, -- Can be different from structure amount (overrides)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE (student_id, fee_structure_id)
);

-- PAYMENTS (Transactions)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    
    amount_paid NUMERIC(10, 2) NOT NULL CHECK (amount_paid > 0),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_mode TEXT CHECK (payment_mode IN ('cash', 'online', 'cheque', 'bank_transfer')) NOT NULL DEFAULT 'cash',
    reference_no TEXT, -- Cheque number, Transaction ID
    remarks TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 2. RLS POLICIES
-- ==========================================

ALTER TABLE public.fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- HELPER
CREATE OR REPLACE FUNCTION public.can_manage_fees()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role_id = rp.role_id
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = auth.uid()
    AND p.code IN ('FEES_SETUP', 'PAYMENT_RECORD')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- FEE STRUCTURES
-- View: School Users
CREATE POLICY "School users view fee structures" ON public.fee_structures
    FOR SELECT USING (school_id = public.get_my_school_id());

-- Manage: Admin
CREATE POLICY "Admin manage fee structures" ON public.fee_structures
    FOR ALL USING (
        school_id = public.get_my_school_id() AND public.can_manage_fees()
    );


-- STUDENT FEES
-- View: Staff + Self
CREATE POLICY "Staff view student fees" ON public.student_fees
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.students s
            WHERE s.id = public.student_fees.student_id
            AND s.school_id = public.get_my_school_id()
        )
    );

CREATE POLICY "Student view own fees" ON public.student_fees
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.students s
            WHERE s.id = public.student_fees.student_id
            AND (
                s.admission_id IN (SELECT id FROM public.admissions WHERE applicant_user_id = auth.uid()) OR
                EXISTS (SELECT 1 FROM public.student_parents sp WHERE sp.student_id = s.id AND sp.parent_user_id = auth.uid())
            )
        )
    );

-- Manage: Admin
CREATE POLICY "Admin manage student fees" ON public.student_fees
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.students s
            WHERE s.id = public.student_fees.student_id
            AND s.school_id = public.get_my_school_id()
            AND public.can_manage_fees()
        )
    );


-- PAYMENTS
-- View: Staff + Self
CREATE POLICY "Staff view payments" ON public.payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.students s
            WHERE s.id = public.payments.student_id
            AND s.school_id = public.get_my_school_id()
        )
    );

CREATE POLICY "Student view own payments" ON public.payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.students s
            WHERE s.id = public.payments.student_id
            AND (
                s.admission_id IN (SELECT id FROM public.admissions WHERE applicant_user_id = auth.uid()) OR
                EXISTS (SELECT 1 FROM public.student_parents sp WHERE sp.student_id = s.id AND sp.parent_user_id = auth.uid())
            )
        )
    );

-- Manage: Admin (Insert Only typically, but allow ALL for corrections by Admin)
CREATE POLICY "Admin manage payments" ON public.payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.students s
            WHERE s.id = public.payments.student_id
            AND s.school_id = public.get_my_school_id()
            AND public.can_manage_fees()
        )
    );
