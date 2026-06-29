-- ==================================================
-- 085_admission_sprint6_enrollment.sql
-- Phase 3 Sprint 6 Fee Collection & Student Enrollment Handover
-- ==================================================

BEGIN;

-- 1. ADMISSION FEE STRUCTURES TEMPLATE
CREATE TABLE IF NOT EXISTS public.admission_fee_structures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    grade TEXT NOT NULL,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_fee_structure UNIQUE (school_id, grade, academic_year_id)
);

-- Seed Default Fee Structures
INSERT INTO public.admission_fee_structures (school_id, grade, academic_year_id, name)
SELECT 
    s.id as school_id,
    g.grade,
    y.id as academic_year_id,
    g.grade || ' Fee Structure Template' as name
FROM public.schools s
CROSS JOIN (SELECT unnest(array['Nursery', 'LKG', 'UKG', 'Grade 1']) as grade) g
CROSS JOIN public.academic_years y
ON CONFLICT (school_id, grade, academic_year_id) DO NOTHING;

-- 2. ADMISSION FEE COMPONENTS
CREATE TABLE IF NOT EXISTS public.admission_fee_components (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    structure_id UUID REFERENCES public.admission_fee_structures(id) ON DELETE CASCADE NOT NULL,
    component_name TEXT NOT NULL, -- e.g. 'Registration Fee', 'Admission Fee', 'Caution Deposit', etc.
    amount NUMERIC NOT NULL,
    mandatory BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed Default Fee Components
INSERT INTO public.admission_fee_components (structure_id, component_name, amount, mandatory)
SELECT id, 'Admission Fee', 10000.00, true FROM public.admission_fee_structures
ON CONFLICT DO NOTHING;
INSERT INTO public.admission_fee_components (structure_id, component_name, amount, mandatory)
SELECT id, 'Registration Fee', 2000.00, true FROM public.admission_fee_structures
ON CONFLICT DO NOTHING;
INSERT INTO public.admission_fee_components (structure_id, component_name, amount, mandatory)
SELECT id, 'Security Deposit (Caution)', 5000.00, true FROM public.admission_fee_structures
ON CONFLICT DO NOTHING;

-- 3. ADMISSION FEE ASSIGNMENTS (Fees allocated per candidate application)
CREATE TABLE IF NOT EXISTS public.admission_fee_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES public.admission_applications(id) ON DELETE CASCADE NOT NULL,
    component_id UUID REFERENCES public.admission_fee_components(id) ON DELETE RESTRICT NOT NULL,
    amount NUMERIC NOT NULL,
    waived_amount NUMERIC NOT NULL DEFAULT 0,
    paid_amount NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_app_fee_component UNIQUE (application_id, component_id)
);

-- 4. ADMISSION PAYMENTS TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.admission_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES public.admission_applications(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC NOT NULL,
    payment_mode TEXT NOT NULL CHECK (payment_mode IN ('Cash', 'Card', 'Cheque', 'Bank_Transfer', 'Online_Gateway')),
    transaction_number TEXT,
    gateway_reference TEXT,
    receipt_number TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. ADMISSION PAYMENT RECEIPTS METADATA
CREATE TABLE IF NOT EXISTS public.admission_payment_receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID REFERENCES public.admission_payments(id) ON DELETE CASCADE UNIQUE NOT NULL,
    receipt_number TEXT UNIQUE NOT NULL,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. ADMISSION FEE WAIVERS (Scholarships & discounts)
CREATE TABLE IF NOT EXISTS public.admission_fee_waivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES public.admission_applications(id) ON DELETE CASCADE NOT NULL,
    component_id UUID REFERENCES public.admission_fee_components(id) ON DELETE RESTRICT NOT NULL,
    amount NUMERIC NOT NULL,
    remarks TEXT NOT NULL,
    approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. ADMISSION CONFIRMATION INDEX
CREATE TABLE IF NOT EXISTS public.admission_confirmation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES public.admission_applications(id) ON DELETE CASCADE UNIQUE NOT NULL,
    student_id UUID, -- Links to public.students table post-enrollment creation
    admission_number TEXT UNIQUE NOT NULL,
    confirmed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- 8. ADMISSION NUMBER SEQUENCES (Prefix formats sequences per school)
CREATE TABLE IF NOT EXISTS public.admission_number_sequences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE UNIQUE NOT NULL,
    prefix TEXT NOT NULL DEFAULT 'SCH-2026-',
    suffix TEXT NOT NULL DEFAULT '',
    current_value INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed sequences
INSERT INTO public.admission_number_sequences (school_id, prefix)
SELECT id, 'SCH-2026-' FROM public.schools
ON CONFLICT (school_id) DO NOTHING;

-- 9. ADMISSION ENROLLMENT LOGS (Audit logs)
CREATE TABLE IF NOT EXISTS public.admission_enrollment_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES public.admission_applications(id) ON DELETE CASCADE NOT NULL,
    action TEXT NOT NULL,
    details TEXT,
    performed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. ENROLLMENT WORKFLOW RULES
CREATE TABLE IF NOT EXISTS public.enrollment_workflow_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_status TEXT NOT NULL,
    to_status TEXT NOT NULL,
    role TEXT NOT NULL,
    allowed BOOLEAN DEFAULT true,
    CONSTRAINT unique_enrollment_workflow UNIQUE (from_status, to_status, role)
);

-- Seed Enrollment Workflow Rules
INSERT INTO public.enrollment_workflow_rules (from_status, to_status, role, allowed) VALUES
('OFFER_ACCEPTED', 'PAYMENT_PENDING', 'admission_officer', true),
('OFFER_ACCEPTED', 'PAYMENT_PENDING', 'admin', true),
('PAYMENT_PENDING', 'PAYMENT_COMPLETED', 'finance_officer', true),
('PAYMENT_PENDING', 'PAYMENT_COMPLETED', 'admin', true),
('PAYMENT_COMPLETED', 'ADMISSION_CONFIRMED', 'admission_officer', true),
('PAYMENT_COMPLETED', 'ADMISSION_CONFIRMED', 'admin', true),
('ADMISSION_CONFIRMED', 'STUDENT_CREATED', 'system', true),
('ADMISSION_CONFIRMED', 'STUDENT_CREATED', 'admin', true),
('STUDENT_CREATED', 'ENROLLED', 'admission_officer', true),
('STUDENT_CREATED', 'ENROLLED', 'admin', true)
ON CONFLICT (from_status, to_status, role) DO UPDATE SET allowed = EXCLUDED.allowed;

-- 11. STUDENT PROVISIONING JOBS (Tracks handoff state loops)
CREATE TABLE IF NOT EXISTS public.student_provisioning_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES public.admission_applications(id) ON DELETE CASCADE NOT NULL,
    step_name TEXT NOT NULL, -- e.g. 'Student', 'Academic', 'Parent', 'User', 'Transport', etc.
    status TEXT NOT NULL DEFAULT 'PENDING',
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_job_step UNIQUE (application_id, step_name)
);

-- 12. ADMISSION CONVERSION ANALYTICS
CREATE TABLE IF NOT EXISTS public.admission_conversion_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
    total_leads INT DEFAULT 0,
    total_applications INT DEFAULT 0,
    total_admissions INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. SEED NEW ENROLLMENT FEATURE FLAGS
INSERT INTO public.feature_flags (module, feature_key, enabled, environment, description) VALUES
('admission', 'fee_collection', true, 'development', 'Allows setting fee structures and collecting payments'),
('admission', 'student_enrollment', true, 'development', 'Allows confirming candidates admissions and enrollment'),
('admission', 'student_id_generation', true, 'development', 'Allows generating school-specific admission sequences'),
('admission', 'erp_handover', true, 'development', 'Allows provisioning records in Student Master')
ON CONFLICT (module, feature_key, environment, tenant_id) DO NOTHING;

-- 14. SEED NEW ENROLLMENT PERMISSIONS
INSERT INTO public.permissions (code, description) VALUES
('admission.fees.manage', 'Allows configuring grade-wise fees structure'),
('admission.payments.record', 'Allows posting payment transactions and waivers'),
('admission.confirm.enroll', 'Allows running final student creation ERP integrations')
ON CONFLICT (code) DO NOTHING;

COMMIT;
