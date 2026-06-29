-- ==================================================
-- 082_admission_sprint3_application.sql
-- Phase 3 Sprint 3 Digital Admission Application
-- ==================================================

BEGIN;

-- 1. ADMISSION AGE ELIGIBILITY RULES
CREATE TABLE IF NOT EXISTS public.admission_age_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grade TEXT UNIQUE NOT NULL,
    min_age INT NOT NULL,
    max_age INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed Age Rules
INSERT INTO public.admission_age_rules (grade, min_age, max_age) VALUES
('Nursery', 3, 4),
('LKG', 4, 5),
('UKG', 5, 6),
('Grade 1', 6, 7)
ON CONFLICT (grade) DO UPDATE SET 
    min_age = EXCLUDED.min_age,
    max_age = EXCLUDED.max_age;

-- 2. WORKFLOW RULES TABLE (Configurable transitions mapping roles)
CREATE TABLE IF NOT EXISTS public.workflow_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_status TEXT NOT NULL,
    to_status TEXT NOT NULL,
    role TEXT NOT NULL,
    allowed BOOLEAN DEFAULT true,
    CONSTRAINT unique_workflow_rule UNIQUE (from_status, to_status, role)
);

-- Seed Workflow transitions
INSERT INTO public.workflow_rules (from_status, to_status, role, allowed) VALUES
('DRAFT', 'IN_PROGRESS', 'counselor', true),
('DRAFT', 'IN_PROGRESS', 'admission_officer', true),
('DRAFT', 'IN_PROGRESS', 'admin', true),
('IN_PROGRESS', 'UNDER_REVIEW', 'counselor', true),
('IN_PROGRESS', 'UNDER_REVIEW', 'admission_officer', true),
('IN_PROGRESS', 'UNDER_REVIEW', 'admin', true),
('UNDER_REVIEW', 'CORRECTION_REQUIRED', 'admission_officer', true),
('UNDER_REVIEW', 'CORRECTION_REQUIRED', 'admin', true),
('CORRECTION_REQUIRED', 'IN_PROGRESS', 'counselor', true),
('CORRECTION_REQUIRED', 'IN_PROGRESS', 'admission_officer', true),
('CORRECTION_REQUIRED', 'IN_PROGRESS', 'admin', true),
('IN_PROGRESS', 'SUBMITTED', 'counselor', true),
('IN_PROGRESS', 'SUBMITTED', 'admission_officer', true),
('IN_PROGRESS', 'SUBMITTED', 'admin', true)
ON CONFLICT (from_status, to_status, role) DO UPDATE SET 
    allowed = EXCLUDED.allowed;

-- 3. ADMISSION APPLICATIONS TABLE (Versioned)
CREATE TABLE IF NOT EXISTS public.admission_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
    lead_id UUID REFERENCES public.admission_leads(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'DRAFT',
    version INT NOT NULL DEFAULT 1,
    is_current BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    change_reason TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_applications_lead ON public.admission_applications (lead_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.admission_applications (status);

-- 4. APPLICATION PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.application_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES public.admission_applications(id) ON DELETE CASCADE NOT NULL,
    date_of_birth DATE NOT NULL,
    gender TEXT NOT NULL,
    blood_group TEXT,
    nationality TEXT,
    religion TEXT,
    category TEXT,
    aadhaar TEXT,
    photo_url TEXT,
    allergies TEXT,
    medical_conditions TEXT,
    emergency_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. APPLICATION PARENTS TABLE
CREATE TABLE IF NOT EXISTS public.application_parents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES public.admission_applications(id) ON DELETE CASCADE NOT NULL,
    father_name TEXT,
    mother_name TEXT,
    guardian_name TEXT,
    guardian_relation TEXT,
    father_occupation TEXT,
    mother_occupation TEXT,
    guardian_occupation TEXT,
    father_income NUMERIC,
    mother_income NUMERIC,
    guardian_income NUMERIC,
    father_education TEXT,
    mother_education TEXT,
    guardian_education TEXT,
    father_phone TEXT,
    mother_phone TEXT,
    guardian_phone TEXT,
    father_email TEXT,
    mother_email TEXT,
    guardian_email TEXT,
    father_address TEXT,
    mother_address TEXT,
    guardian_address TEXT,
    emergency_contact TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. APPLICATION PREVIOUS EDUCATION TABLE
CREATE TABLE IF NOT EXISTS public.application_previous_education (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES public.admission_applications(id) ON DELETE CASCADE NOT NULL,
    school_name TEXT NOT NULL,
    board TEXT,
    medium TEXT,
    last_class TEXT,
    percentage NUMERIC,
    subjects TEXT,
    tc_number TEXT,
    reason_leaving TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. APPLICATION PREFERENCES TABLE (Transport + Hostel)
CREATE TABLE IF NOT EXISTS public.application_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES public.admission_applications(id) ON DELETE CASCADE NOT NULL,
    need_transport BOOLEAN DEFAULT false,
    route_preference TEXT,
    pickup_point TEXT,
    need_hostel BOOLEAN DEFAULT false,
    room_preference TEXT,
    special_requirements TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. APPLICATION DECLARATIONS TABLE
CREATE TABLE IF NOT EXISTS public.application_declarations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES public.admission_applications(id) ON DELETE CASCADE NOT NULL,
    agreed_to_terms BOOLEAN NOT NULL DEFAULT false,
    parent_signature TEXT,
    date_signed DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. APPLICATION WORKFLOW TIMELINE TABLE
CREATE TABLE IF NOT EXISTS public.application_workflow (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES public.admission_applications(id) ON DELETE CASCADE NOT NULL,
    action TEXT NOT NULL,
    from_status TEXT,
    to_status TEXT NOT NULL,
    performed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. SEED NEW APPLICATION FEATURE FLAGS
INSERT INTO public.feature_flags (module, feature_key, enabled, environment, description) VALUES
('admission', 'application_management', true, 'development', 'Allows digital application form management'),
('admission', 'application_draft', true, 'development', 'Allows draft autosave and edits tracking'),
('admission', 'application_parent', true, 'development', 'Enables parent section inputs details validation'),
('admission', 'application_previous_school', true, 'development', 'Enables previous education history validation'),
('admission', 'application_declaration', true, 'development', 'Enables declaration checks'),
('admission', 'application_medical', true, 'development', 'Enables medical profile attributes checks'),
('admission', 'application_transport', true, 'development', 'Enables transport route preferences checks'),
('admission', 'application_hostel', true, 'development', 'Enables hostel preferences checks')
ON CONFLICT (module, feature_key, environment, tenant_id) DO NOTHING;

-- 11. SEED NEW APPLICATION PERMISSIONS
INSERT INTO public.permissions (code, description) VALUES
('admission.application.create', 'Allows drafting and registering new applications'),
('admission.application.update', 'Allows updating drafts or corrections details'),
('admission.application.submit', 'Allows submitting under-review applications'),
('admission.application.view', 'Allows viewing digital applications list and timeline'),
('admission.application.delete', 'Allows deleting drafts applications')
ON CONFLICT (code) DO NOTHING;

COMMIT;
