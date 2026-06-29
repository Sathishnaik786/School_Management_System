-- ==================================================
-- 086_student_master.sql
-- Phase 4 Sprint 7 Student Information System (SIS) Foundation
-- ==================================================

BEGIN;

-- 1. CENTRAL STUDENTS MASTER TABLE
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    admission_no TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'NEW',
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_students_status ON public.students (status);
CREATE INDEX IF NOT EXISTS idx_students_school ON public.students (school_id);

-- 2. STUDENT PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.student_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE UNIQUE NOT NULL,
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

-- 3. STUDENT PARENTS TABLE
CREATE TABLE IF NOT EXISTS public.student_parents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    parent_name TEXT NOT NULL,
    relation TEXT NOT NULL CHECK (relation IN ('Father', 'Mother', 'Stepfather', 'Stepmother')),
    mobile_number TEXT,
    email TEXT,
    occupation TEXT,
    aadhaar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. STUDENT GUARDIANS TABLE
CREATE TABLE IF NOT EXISTS public.student_guardians (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    guardian_name TEXT NOT NULL,
    relation TEXT NOT NULL,
    mobile_number TEXT NOT NULL,
    email TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. STUDENT DOCUMENTS (References to uploaded documents without file duplication)
CREATE TABLE IF NOT EXISTS public.student_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    document_id UUID REFERENCES public.admission_documents(id) ON DELETE CASCADE NOT NULL,
    document_type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. STUDENT ACADEMIC RECORDS (Cumulative academic status across grades)
CREATE TABLE IF NOT EXISTS public.student_academic_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
    grade TEXT NOT NULL,
    gpa_or_marks TEXT,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. STUDENT CLASS ALLOCATIONS (Current section roll call settings)
CREATE TABLE IF NOT EXISTS public.student_class_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE UNIQUE NOT NULL,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
    grade TEXT NOT NULL,
    section_id UUID NOT NULL, -- Logical section ID from academic structures
    roll_number INT NOT NULL,
    allocated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_section_roll UNIQUE (academic_year_id, grade, section_id, roll_number)
);

-- 8. STUDENT SECTION ALLOCATIONS HISTORY
CREATE TABLE IF NOT EXISTS public.student_section_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    from_section_id UUID,
    to_section_id UUID NOT NULL,
    grade TEXT NOT NULL,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
    transferred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reason TEXT
);

-- 9. STUDENT ROLL NUMBER SEQUENCES
CREATE TABLE IF NOT EXISTS public.student_roll_number_sequences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
    grade TEXT NOT NULL,
    section_id UUID NOT NULL,
    current_value INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_section_sequence UNIQUE (school_id, academic_year_id, grade, section_id)
);

-- 10. STUDENT PROMOTIONS HISTORY (Cumulative promotions log tracker)
CREATE TABLE IF NOT EXISTS public.student_promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    from_academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
    to_academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
    from_grade TEXT NOT NULL,
    to_grade TEXT NOT NULL,
    from_section_id UUID,
    to_section_id UUID,
    promoted_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    promoted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    promotion_reason TEXT NOT NULL
);

-- 11. STUDENT IDENTITY CARDS REGISTER
CREATE TABLE IF NOT EXISTS public.student_identity_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE UNIQUE NOT NULL,
    barcode TEXT UNIQUE NOT NULL,
    qr_code TEXT,
    printed BOOLEAN NOT NULL DEFAULT false,
    issued_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. STUDENT BARCODES
CREATE TABLE IF NOT EXISTS public.student_barcodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    barcode_value TEXT UNIQUE NOT NULL,
    symbology TEXT NOT NULL DEFAULT 'CODE128',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. STUDENT LIFECYCLE STATUS HISTORY
CREATE TABLE IF NOT EXISTS public.student_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    old_status TEXT NOT NULL,
    new_status TEXT NOT NULL,
    reason TEXT,
    changed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. STUDENT TRANSFER OUT REQUESTS
CREATE TABLE IF NOT EXISTS public.student_transfer_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    destination_school TEXT NOT NULL,
    reason TEXT NOT NULL,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED'))
);

-- 15. STUDENT EXIT RECORDS
CREATE TABLE IF NOT EXISTS public.student_exit_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE UNIQUE NOT NULL,
    exit_type TEXT NOT NULL CHECK (exit_type IN ('Transfer', 'Graduation', 'Withdrawal', 'Dismissal')),
    exit_date DATE NOT NULL,
    reason TEXT,
    processed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 16. STUDENT LIFECYCLE WORKFLOW RULES
CREATE TABLE IF NOT EXISTS public.student_workflow_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_status TEXT NOT NULL,
    to_status TEXT NOT NULL,
    role TEXT NOT NULL,
    allowed BOOLEAN DEFAULT true,
    CONSTRAINT unique_student_workflow UNIQUE (from_status, to_status, role)
);

-- Seed Status Transitions
INSERT INTO public.student_workflow_rules (from_status, to_status, role, allowed) VALUES
('NEW', 'ACTIVE', 'admin', true),
('NEW', 'ACTIVE', 'admission_officer', true),
('ACTIVE', 'PROMOTED', 'admin', true),
('ACTIVE', 'PROMOTED', 'teacher', true),
('PROMOTED', 'ACTIVE', 'admin', true),
('ACTIVE', 'SUSPENDED', 'admin', true),
('SUSPENDED', 'ACTIVE', 'admin', true),
('ACTIVE', 'TRANSFERRED', 'admin', true),
('ACTIVE', 'LEFT', 'admin', true),
('ACTIVE', 'ALUMNI', 'admin', true),
('PROMOTED', 'ALUMNI', 'admin', true)
ON CONFLICT (from_status, to_status, role) DO UPDATE SET allowed = EXCLUDED.allowed;

-- Seed Feature Flags
INSERT INTO public.feature_flags (module, feature_key, enabled, environment, description) VALUES
('student', 'student_management', true, 'development', 'Allows basic student enrollment management'),
('student', 'student_profile', true, 'development', 'Allows setting student profile demographics'),
('student', 'student_promotion', true, 'development', 'Allows class Promotions and roll changes'),
('student', 'student_transfer', true, 'development', 'Allows processing transfers and exits'),
('student', 'student_identity', true, 'development', 'Allows printing ID Cards and generating barcode symbologies'),
('student', 'student_guardian', true, 'development', 'Allows managing parent and guardian mappings')
ON CONFLICT (module, feature_key, environment, tenant_id) DO NOTHING;

-- Seed SIS Permissions
INSERT INTO public.permissions (code, description) VALUES
('student.create', 'Allows registering student master details'),
('student.update', 'Allows updating demographics and profiles'),
('student.view', 'Allows viewing student information pages'),
('student.delete', 'Allows soft-deleting student records'),
('student.promote', 'Allows executing grade promotion sequences'),
('student.transfer', 'Allows approving transfer out certificates'),
('student.identity.generate', 'Allows printing school ID cards and generating barcodes')
ON CONFLICT (code) DO NOTHING;

COMMIT;
