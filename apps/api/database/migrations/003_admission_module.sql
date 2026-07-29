-- ==========================================
-- 1. TABLES
-- ==========================================

-- ADMISSIONS
CREATE TABLE IF NOT EXISTS public.admissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
    applicant_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    
    student_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
    grade_applied_for TEXT NOT NULL,
    
    status TEXT CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected')) DEFAULT 'draft',
    
    submitted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DOCUMENTS
CREATE TABLE IF NOT EXISTS public.admission_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admission_id UUID REFERENCES public.admissions(id) ON DELETE CASCADE NOT NULL,
    document_type TEXT NOT NULL,
    file_url TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.admission_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admission_id UUID REFERENCES public.admissions(id) ON DELETE CASCADE NOT NULL,
    action TEXT NOT NULL, -- SUBMITTED, REVIEWED, APPROVED, REJECTED
    performed_by UUID REFERENCES public.users(id) ON DELETE SET NULL, -- User who performed action
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 2. RLS POLICIES
-- ==========================================

ALTER TABLE public.admissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admission_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admission_audit_logs ENABLE ROW LEVEL SECURITY;

-- HELPER: Check if user has admission access (Counsellor/Admin) for their school
CREATE OR REPLACE FUNCTION public.can_manage_admissions()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role_id = rp.role_id
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = auth.uid()
    AND p.code IN ('ADMISSION_REVIEW', 'ADMISSION_APPROVE', 'ADMISSION_REJECT')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ADMISSIONS POLICIES

-- View:
-- 1. Applicant can view their own
-- 2. Staff with permission can view their school's admissions
CREATE POLICY "Applicant view own" ON public.admissions
    FOR SELECT USING (applicant_user_id = auth.uid());

CREATE POLICY "Staff view school admissions" ON public.admissions
    FOR SELECT USING (
        school_id = public.get_my_school_id() 
        AND public.can_manage_admissions()
    );

-- Insert:
-- Authenticated users can create (usually Applicant)
CREATE POLICY "Applicant create" ON public.admissions
    FOR INSERT WITH CHECK (applicant_user_id = auth.uid());

-- Update:
-- 1. Applicant can update specific fields if status is 'draft'
CREATE POLICY "Applicant update draft" ON public.admissions
    FOR UPDATE USING (
        applicant_user_id = auth.uid() AND status = 'draft'
    );

-- 2. Staff can update status (handled via Backend mostly, but enabling for transparency if needed)
CREATE POLICY "Staff update status" ON public.admissions
    FOR UPDATE USING (
        school_id = public.get_my_school_id() 
        AND public.can_manage_admissions()
    );

-- DOCUMENTS POLICIES
-- Follows admission visibility
CREATE POLICY "View documents" ON public.admission_documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.admissions a 
            WHERE a.id = admission_documents.admission_id
            AND (
                a.applicant_user_id = auth.uid() OR 
                (a.school_id = public.get_my_school_id() AND public.can_manage_admissions())
            )
        )
    );

CREATE POLICY "Upload documents" ON public.admission_documents
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admissions a 
            WHERE a.id = admission_documents.admission_id
            AND a.applicant_user_id = auth.uid()
            AND a.status = 'draft'
        )
    );

-- AUDIT LOGS POLICIES
-- Viewable by staff and applicant (maybe applicant only sees some? Let's allow all for transparency for now)
CREATE POLICY "View audit logs" ON public.admission_audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.admissions a 
            WHERE a.id = admission_audit_logs.admission_id
            AND (
                a.applicant_user_id = auth.uid() OR 
                (a.school_id = public.get_my_school_id() AND public.can_manage_admissions())
            )
        )
    );

-- Insert: Only backend should insert really, but we allow Authenticated for the trigger or manual insert if needed?
-- Better to strictly control via RLS or logic.
-- Let's allow insert for Staff/Applicant involved.
CREATE POLICY "Insert audit logs" ON public.admission_audit_logs
    FOR INSERT WITH CHECK (
        auth.uid() = performed_by
    );
