-- ==================================================
-- 083_admission_sprint4_documents.sql
-- Phase 3 Sprint 4 Documents Management & Verification
-- ==================================================

BEGIN;

-- 1. CONFIGURABLE DOCUMENT TYPES TABLE
CREATE TABLE IF NOT EXISTS public.document_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('Identity', 'Academic', 'Medical', 'Financial', 'Residence', 'Photograph', 'Other')),
    mandatory BOOLEAN NOT NULL DEFAULT false,
    allowed_extensions TEXT[] NOT NULL DEFAULT '{"pdf", "jpg", "jpeg", "png"}',
    allowed_mime_types TEXT[] NOT NULL DEFAULT '{"application/pdf", "image/jpeg", "image/png"}',
    max_file_size INT NOT NULL DEFAULT 5242880, -- 5MB default
    active BOOLEAN NOT NULL DEFAULT true,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed default Document Types
INSERT INTO public.document_types (code, name, description, category, mandatory, max_file_size) VALUES
('birth_certificate', 'Birth Certificate', 'Official certificate verifying birth', 'Identity', true, 5242880),
('student_photo', 'Student Photograph', 'Recent passport size photo', 'Photograph', true, 2097152), -- 2MB max
('parent_aadhaar', 'Parent Aadhaar Card', 'Copy of parent identity card', 'Identity', true, 5242880),
('academic_marksheet', 'Academic Mark Sheet', 'Report card of the previous grade', 'Academic', false, 10485760), -- 10MB max
('medical_certificate', 'Medical Health Card', 'Certified doctor immunization details', 'Medical', false, 5242880),
('transfer_certificate', 'Transfer Certificate', 'TC from previous educational institution', 'Academic', false, 10485760)
ON CONFLICT (code) DO UPDATE SET 
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    mandatory = EXCLUDED.mandatory;

-- 2. WORKFLOW RULES TABLE (Configurable document status transitions rules)
CREATE TABLE IF NOT EXISTS public.document_workflow_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_status TEXT NOT NULL,
    to_status TEXT NOT NULL,
    role TEXT NOT NULL,
    allowed BOOLEAN DEFAULT true,
    CONSTRAINT unique_doc_workflow_rule UNIQUE (from_status, to_status, role)
);

-- Seed document allowed workflow transitions
INSERT INTO public.document_workflow_rules (from_status, to_status, role, allowed) VALUES
('UPLOADED', 'PENDING_VERIFICATION', 'counselor', true),
('UPLOADED', 'PENDING_VERIFICATION', 'admission_officer', true),
('UPLOADED', 'PENDING_VERIFICATION', 'admin', true),
('PENDING_VERIFICATION', 'VERIFIED', 'admission_officer', true),
('PENDING_VERIFICATION', 'VERIFIED', 'admin', true),
('PENDING_VERIFICATION', 'REJECTED', 'admission_officer', true),
('PENDING_VERIFICATION', 'REJECTED', 'admin', true),
('PENDING_VERIFICATION', 'CORRECTION_REQUIRED', 'admission_officer', true),
('PENDING_VERIFICATION', 'CORRECTION_REQUIRED', 'admin', true),
('REJECTED', 'REUPLOADED', 'counselor', true),
('REJECTED', 'REUPLOADED', 'admission_officer', true),
('REJECTED', 'REUPLOADED', 'admin', true),
('CORRECTION_REQUIRED', 'REUPLOADED', 'counselor', true),
('CORRECTION_REQUIRED', 'REUPLOADED', 'admission_officer', true),
('CORRECTION_REQUIRED', 'REUPLOADED', 'admin', true),
('REUPLOADED', 'PENDING_VERIFICATION', 'counselor', true),
('REUPLOADED', 'PENDING_VERIFICATION', 'admission_officer', true),
('REUPLOADED', 'PENDING_VERIFICATION', 'admin', true)
ON CONFLICT (from_status, to_status, role) DO UPDATE SET 
    allowed = EXCLUDED.allowed;

-- 3. APPLICATION DOCUMENTS METADATA INDEX
CREATE TABLE IF NOT EXISTS public.application_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES public.admission_applications(id) ON DELETE CASCADE NOT NULL,
    document_type_id UUID REFERENCES public.document_types(id) ON DELETE RESTRICT NOT NULL,
    original_filename TEXT NOT NULL,
    stored_filename TEXT NOT NULL,
    storage_provider TEXT NOT NULL DEFAULT 'Supabase',
    storage_bucket TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    extension TEXT NOT NULL,
    file_size INT NOT NULL,
    checksum TEXT UNIQUE NOT NULL,
    version INT NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'UPLOADED',
    uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    verified_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_app ON public.application_documents (application_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.application_documents (status);

-- 4. DOCUMENT VERSIONS TABLE (Incremental uploads history)
CREATE TABLE IF NOT EXISTS public.document_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES public.application_documents(id) ON DELETE CASCADE NOT NULL,
    version INT NOT NULL,
    storage_path TEXT NOT NULL,
    checksum TEXT NOT NULL,
    uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. DOCUMENT REVIEW VERIFICATION LOGS
CREATE TABLE IF NOT EXISTS public.document_verification (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES public.application_documents(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL,
    reviewer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    remarks TEXT,
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. DOCUMENT REVIEWER COMMENTS LOGS
CREATE TABLE IF NOT EXISTS public.document_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES public.application_documents(id) ON DELETE CASCADE NOT NULL,
    comment TEXT NOT NULL,
    comment_type TEXT NOT NULL DEFAULT 'REVIEWER', -- 'REVIEWER', 'SYSTEM'
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. CONFIGURABLE DOCUMENT CHECKLISTS (Grade-wise & Admission Type rules)
CREATE TABLE IF NOT EXISTS public.document_checklists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
    grade TEXT NOT NULL,
    admission_type TEXT NOT NULL DEFAULT 'Regular',
    document_type_id UUID REFERENCES public.document_types(id) ON DELETE CASCADE NOT NULL,
    mandatory BOOLEAN NOT NULL DEFAULT true,
    minimum_copies INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_checklist_rule UNIQUE (school_id, academic_year_id, grade, admission_type, document_type_id)
);

-- 8. SEED NEW FEATURES FLAGS
INSERT INTO public.feature_flags (module, feature_key, enabled, environment, description) VALUES
('admission', 'application_documents', true, 'development', 'Allows file attachments on applications'),
('admission', 'document_upload', true, 'development', 'Enables document uploading workflows'),
('admission', 'document_download', true, 'development', 'Enables downloading documents via short signed URLs'),
('admission', 'document_verification', true, 'development', 'Enables verification review workflows'),
('admission', 'document_checklist', true, 'development', 'Enables checklist checks per grade')
ON CONFLICT (module, feature_key, environment, tenant_id) DO NOTHING;

-- 9. SEED NEW DOCUMENTS PERMISSIONS
INSERT INTO public.permissions (code, description) VALUES
('admission.document.upload', 'Allows uploading files metadata'),
('admission.document.view', 'Allows checking uploaded files metadata list'),
('admission.document.delete', 'Allows deleting uploaded files'),
('admission.document.verify', 'Allows marking documents verified or rejected'),
('admission.document.download', 'Allows requesting short signed read URLs'),
('admission.document.checklist', 'Allows creating and editing checklists')
ON CONFLICT (code) DO NOTHING;

COMMIT;
