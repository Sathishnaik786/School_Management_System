-- ==================================================
-- 099_finance_module_production.sql
-- Phase 1 - Finance Foundation Implementation
-- ==================================================

BEGIN;

-- ==================================================
-- 1. TEMPLATES & VERSIONS
-- ==================================================

CREATE TABLE IF NOT EXISTS public.finance_fee_structures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    version INT NOT NULL DEFAULT 1,
    effective_from DATE NOT NULL,
    effective_to DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    published_by UUID REFERENCES public.users(id),
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_school_year_name_version UNIQUE (school_id, academic_year_id, name, version)
);

CREATE TABLE IF NOT EXISTS public.finance_fee_structure_classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fee_structure_id UUID REFERENCES public.finance_fee_structures(id) ON DELETE CASCADE NOT NULL,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
    UNIQUE (fee_structure_id, class_id)
);

CREATE TABLE IF NOT EXISTS public.finance_fee_structure_components (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fee_structure_id UUID REFERENCES public.finance_fee_structures(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'Admission', 'Tuition', 'Registration', 'Exam', 'Lab', 
        'Library', 'Sports', 'Transport', 'Hostel', 'Annual', 'Miscellaneous'
    )),
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    display_order INT NOT NULL DEFAULT 0,
    is_mandatory BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.finance_fee_installments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fee_structure_id UUID REFERENCES public.finance_fee_structures(id) ON DELETE CASCADE NOT NULL,
    term TEXT NOT NULL,
    due_date DATE NOT NULL,
    percentage NUMERIC(5, 2) CHECK (percentage BETWEEN 0 AND 100),
    fixed_amount NUMERIC(10, 2) CHECK (fixed_amount >= 0),
    CONSTRAINT check_installment_value CHECK (
        (percentage IS NOT NULL AND fixed_amount IS NULL) OR 
        (percentage IS NULL AND fixed_amount IS NOT NULL)
    )
);

-- ==================================================
-- 2. DEMANDS & BILLING ITEMS
-- ==================================================

CREATE TABLE IF NOT EXISTS public.fee_demands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    demand_no TEXT UNIQUE NOT NULL,
    application_id UUID REFERENCES public.admission_applications(id) ON DELETE SET NULL,
    student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
    fee_structure_id UUID REFERENCES public.finance_fee_structures(id) ON DELETE SET NULL,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    balance_amount NUMERIC(10, 2) NOT NULL CHECK (balance_amount >= 0),
    due_date DATE NOT NULL,
    status TEXT CHECK (status IN ('PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'CANCELLED')) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT check_demand_owner CHECK (application_id IS NOT NULL OR student_id IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS public.fee_demand_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    demand_id UUID REFERENCES public.fee_demands(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0)
);

-- ==================================================
-- 3. TRANSACTIONS, LEDGERS & RECEIPTS
-- ==================================================

CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES public.admission_applications(id) ON DELETE SET NULL,
    student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    payment_mode TEXT CHECK (payment_mode IN ('Cash', 'UPI', 'Card', 'Cheque', 'Bank_Transfer', 'Online_Gateway')) NOT NULL,
    transaction_reference TEXT,
    bank_name TEXT,
    gateway_name TEXT,
    gateway_transaction_id TEXT,
    gateway_status TEXT,
    gateway_error_code TEXT,
    gateway_error_message TEXT,
    gateway_response JSONB,
    payment_channel TEXT,
    cashier_id UUID REFERENCES public.users(id),
    verified_by UUID REFERENCES public.users(id),
    status TEXT CHECK (status IN (
        'INITIATED', 'PENDING', 'SUCCESS', 'FAILED', 
        'REVERSED', 'REFUNDED', 'CANCELLED'
    )) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.fee_receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    receipt_no TEXT UNIQUE NOT NULL,
    payment_transaction_id UUID REFERENCES public.payment_transactions(id) ON DELETE CASCADE NOT NULL,
    receipt_type TEXT CHECK (receipt_type IN ('ORIGINAL', 'DUPLICATE', 'REPRINT', 'CANCELLED')) NOT NULL DEFAULT 'ORIGINAL',
    pdf_url TEXT,
    status TEXT NOT NULL DEFAULT 'GENERATED',
    generated_by UUID REFERENCES public.users(id),
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    print_count INT NOT NULL DEFAULT 0,
    emailed BOOLEAN NOT NULL DEFAULT false,
    sms_sent BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.student_fee_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES public.admission_applications(id) ON DELETE SET NULL,
    student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
    transaction_type TEXT CHECK (transaction_type IN (
        'DEMAND', 'PAYMENT', 'WAIVER', 'REFUND', 'ADJUSTMENT', 
        'SCHOLARSHIP', 'WRITE_OFF', 'REVERSAL', 'PENALTY', 'LATE_FEE'
    )) NOT NULL,
    debit NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    credit NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    running_balance NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    reference_type TEXT NOT NULL,
    reference_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================================================
-- 4. SYSTEM LOGS & SEQUENCES
-- ==================================================

CREATE TABLE IF NOT EXISTS public.finance_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    performed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.fee_reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES public.admission_applications(id) ON DELETE SET NULL,
    student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
    channel TEXT CHECK (channel IN ('SMS', 'Email', 'WhatsApp', 'Push')) NOT NULL,
    status TEXT CHECK (status IN ('PENDING', 'SENT', 'FAILED')) NOT NULL DEFAULT 'PENDING',
    provider TEXT,
    attempt_count INT NOT NULL DEFAULT 0,
    last_attempt TIMESTAMP WITH TIME ZONE,
    response TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================================================
-- 5. INDEXES FOR PERFORMANCE
-- ==================================================

CREATE INDEX IF NOT EXISTS idx_finance_fee_structures_school ON public.finance_fee_structures(school_id);
CREATE INDEX IF NOT EXISTS idx_finance_fee_structure_classes_struct ON public.finance_fee_structure_classes(fee_structure_id);
CREATE INDEX IF NOT EXISTS idx_fee_demands_student ON public.fee_demands(student_id);
CREATE INDEX IF NOT EXISTS idx_fee_demands_application ON public.fee_demands(application_id);
CREATE INDEX IF NOT EXISTS idx_student_fee_ledger_student ON public.student_fee_ledger(student_id);
CREATE INDEX IF NOT EXISTS idx_student_fee_ledger_application ON public.student_fee_ledger(application_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_student ON public.payment_transactions(student_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_application ON public.payment_transactions(application_id);

-- ==================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ==================================================

ALTER TABLE public.finance_fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_fee_structure_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_fee_structure_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_fee_installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_demands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_demand_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_fee_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_reminders ENABLE ROW LEVEL SECURITY;

-- Dynamic checks for permissions or roles
CREATE OR REPLACE FUNCTION public.has_finance_read()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.has_permission('fees.view') OR public.has_permission('fees.structure.view');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.has_finance_write()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.has_permission('fees.structure.manage') OR public.is_admin();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SELECT policies
DROP POLICY IF EXISTS "Viewable by finance staff" ON public.finance_fee_structures;
CREATE POLICY "Viewable by finance staff" ON public.finance_fee_structures FOR SELECT USING (public.has_finance_read());

DROP POLICY IF EXISTS "Manageable by finance admins" ON public.finance_fee_structures;
CREATE POLICY "Manageable by finance admins" ON public.finance_fee_structures FOR ALL USING (public.has_finance_write());

DROP POLICY IF EXISTS "Viewable by finance staff class link" ON public.finance_fee_structure_classes;
CREATE POLICY "Viewable by finance staff class link" ON public.finance_fee_structure_classes FOR SELECT USING (public.has_finance_read());

DROP POLICY IF EXISTS "Manageable by finance admins class link" ON public.finance_fee_structure_classes;
CREATE POLICY "Manageable by finance admins class link" ON public.finance_fee_structure_classes FOR ALL USING (public.has_finance_write());

DROP POLICY IF EXISTS "Viewable by finance staff component" ON public.finance_fee_structure_components;
CREATE POLICY "Viewable by finance staff component" ON public.finance_fee_structure_components FOR SELECT USING (public.has_finance_read());

DROP POLICY IF EXISTS "Manageable by finance admins component" ON public.finance_fee_structure_components;
CREATE POLICY "Manageable by finance admins component" ON public.finance_fee_structure_components FOR ALL USING (public.has_finance_write());

DROP POLICY IF EXISTS "Viewable by finance staff installment" ON public.finance_fee_installments;
CREATE POLICY "Viewable by finance staff installment" ON public.finance_fee_installments FOR SELECT USING (public.has_finance_read());

DROP POLICY IF EXISTS "Manageable by finance admins installment" ON public.finance_fee_installments;
CREATE POLICY "Manageable by finance admins installment" ON public.finance_fee_installments FOR ALL USING (public.has_finance_write());

DROP POLICY IF EXISTS "Demands viewable by authorized" ON public.fee_demands;
CREATE POLICY "Demands viewable by authorized" ON public.fee_demands FOR SELECT USING (
    public.has_finance_read() OR 
    (auth.uid() IS NOT NULL AND (
        student_id IN (
            SELECT student_id FROM public.student_parents WHERE parent_user_id = auth.uid()
        ) OR 
        application_id IN (
            SELECT id FROM public.admission_applications WHERE created_by = auth.uid()
        )
    ))
);

DROP POLICY IF EXISTS "Demands manageable by finance staff" ON public.fee_demands;
CREATE POLICY "Demands manageable by finance staff" ON public.fee_demands FOR ALL USING (public.has_permission('fees.demand.generate') OR public.is_admin());

DROP POLICY IF EXISTS "Demand items viewable by authorized" ON public.fee_demand_items;
CREATE POLICY "Demand items viewable by authorized" ON public.fee_demand_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.fee_demands d WHERE d.id = fee_demand_items.demand_id)
);

DROP POLICY IF EXISTS "Demand items manageable by finance staff" ON public.fee_demand_items;
CREATE POLICY "Demand items manageable by finance staff" ON public.fee_demand_items FOR ALL USING (public.has_permission('fees.demand.generate') OR public.is_admin());

DROP POLICY IF EXISTS "Payments viewable by authorized" ON public.payment_transactions;
CREATE POLICY "Payments viewable by authorized" ON public.payment_transactions FOR SELECT USING (
    public.has_finance_read() OR 
    (auth.uid() IS NOT NULL AND (
        student_id IN (
            SELECT student_id FROM public.student_parents WHERE parent_user_id = auth.uid()
        ) OR 
        application_id IN (
            SELECT id FROM public.admission_applications WHERE created_by = auth.uid()
        )
    ))
);

DROP POLICY IF EXISTS "Payments manageable by cashiers" ON public.payment_transactions;
CREATE POLICY "Payments manageable by cashiers" ON public.payment_transactions FOR ALL USING (public.has_permission('fees.payment.collect') OR public.is_admin());

DROP POLICY IF EXISTS "Receipts viewable by authorized" ON public.fee_receipts;
CREATE POLICY "Receipts viewable by authorized" ON public.fee_receipts FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.payment_transactions pt WHERE pt.id = fee_receipts.payment_transaction_id)
);

DROP POLICY IF EXISTS "Receipts manageable by cashiers" ON public.fee_receipts;
CREATE POLICY "Receipts manageable by cashiers" ON public.fee_receipts FOR ALL USING (public.has_permission('fees.receipt.generate') OR public.is_admin());

DROP POLICY IF EXISTS "Ledger viewable by authorized" ON public.student_fee_ledger;
CREATE POLICY "Ledger viewable by authorized" ON public.student_fee_ledger FOR SELECT USING (
    public.has_finance_read() OR 
    (auth.uid() IS NOT NULL AND (
        student_id IN (
            SELECT student_id FROM public.student_parents WHERE parent_user_id = auth.uid()
        ) OR 
        application_id IN (
            SELECT id FROM public.admission_applications WHERE created_by = auth.uid()
        )
    ))
);

DROP POLICY IF EXISTS "Ledger manageable by finance engine" ON public.student_fee_ledger;
CREATE POLICY "Ledger manageable by finance engine" ON public.student_fee_ledger FOR ALL USING (public.has_finance_read() OR public.is_admin());

DROP POLICY IF EXISTS "Audit logs manageable by admins" ON public.finance_audit_logs;
CREATE POLICY "Audit logs manageable by admins" ON public.finance_audit_logs FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Reminders manageable by system" ON public.fee_reminders;
CREATE POLICY "Reminders manageable by system" ON public.fee_reminders FOR ALL USING (public.has_finance_read() OR public.is_admin());

COMMIT;
