-- Phase 1: Transport Compliance Document Layer (Additive Schema)
-- Description: Introduces storage for Driver and Vehicle compliance documents (Audit/Safety)
-- Non-breaking: No FK constraints to prevent cascading deletes or blocking logic.

-- ==============================================
-- 1. SCHEMA: Compliance Documents Table
-- ==============================================

CREATE TABLE IF NOT EXISTS public.transport_compliance_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Entity Mapping
    entity_type TEXT NOT NULL CHECK (entity_type IN ('DRIVER', 'VEHICLE')),
    entity_id UUID NOT NULL, -- Intentionally NO FOREIGN KEY to allow audit retention even if entity is deleted
    
    -- Document Details
    doc_type TEXT NOT NULL, -- e.g., 'LICENSE', 'INSURANCE', 'FITNESS_CERT'
    doc_url TEXT,           -- Link to storage bucket
    expiry_date DATE,       -- Critical for logic
    
    -- Verification Status
    is_verified BOOLEAN DEFAULT FALSE,
    
    -- Audit Fields
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    uploaded_by UUID DEFAULT auth.uid() -- Link to uploader if available
);

-- FAIL-SAFE: Ensure columns exist if table was created partially before
ALTER TABLE public.transport_compliance_documents 
ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE public.transport_compliance_documents 
ADD COLUMN IF NOT EXISTS uploaded_by UUID DEFAULT auth.uid();

-- ==============================================
-- 2. INDEXING: Safe Performance Optimization
-- ==============================================

-- Index for Entity Lookups (e.g., "Show me docs for Driver X")
CREATE INDEX IF NOT EXISTS idx_transport_compliance_entity 
    ON public.transport_compliance_documents(entity_type, entity_id);

-- Index for Expiry Queries (e.g., "Show me what expires next month")
CREATE INDEX IF NOT EXISTS idx_transport_compliance_expiry 
    ON public.transport_compliance_documents(expiry_date);

-- Index for Verification Status Filters
CREATE INDEX IF NOT EXISTS idx_transport_compliance_verified 
    ON public.transport_compliance_documents(is_verified);

-- ==============================================
-- 3. ANALYTICS: Read-Only Views
-- ==============================================

-- Drop views first to avoid dependency errors if we need to recreate them
DROP VIEW IF EXISTS public.view_expiring_soon_transport_documents;
DROP VIEW IF EXISTS public.view_expired_transport_documents;

-- VIEW 1: Documents that have already expired
CREATE OR REPLACE VIEW public.view_expired_transport_documents AS
SELECT 
    id,
    entity_type,
    entity_id,
    doc_type,
    expiry_date,
    is_verified,
    uploaded_at
FROM public.transport_compliance_documents
WHERE expiry_date < CURRENT_DATE;

-- VIEW 2: Documents expiring in the next 30 days
CREATE OR REPLACE VIEW public.view_expiring_soon_transport_documents AS
SELECT 
    id,
    entity_type,
    entity_id,
    doc_type,
    expiry_date,
    is_verified,
    days_remaining
FROM (
    SELECT 
        *,
        (expiry_date - CURRENT_DATE) as days_remaining
    FROM public.transport_compliance_documents
) sub
WHERE days_remaining BETWEEN 0 AND 30;

-- ==============================================
-- 4. SECURITY: Row Level Security (Foundation)
-- ==============================================

ALTER TABLE public.transport_compliance_documents ENABLE ROW LEVEL SECURITY;

-- Cleanup existing policies to prevent "policy already exists" errors
DROP POLICY IF EXISTS "Admins can view transport docs" ON public.transport_compliance_documents;
DROP POLICY IF EXISTS "Admins can upload transport docs" ON public.transport_compliance_documents;

-- Policy: Admins and Transport Admins can VIEW all documents
CREATE POLICY "Admins can view transport docs" ON public.transport_compliance_documents
    FOR SELECT
    USING (
        public.is_admin() OR 
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            JOIN public.roles r ON ur.role_id = r.id 
            WHERE ur.user_id = auth.uid() AND r.name = 'TRANSPORT_ADMIN'
        )
    );

-- Policy: Admins and Transport Admins can INSERT documents
CREATE POLICY "Admins can upload transport docs" ON public.transport_compliance_documents
    FOR INSERT
    WITH CHECK (
        public.is_admin() OR 
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            JOIN public.roles r ON ur.role_id = r.id 
            WHERE ur.user_id = auth.uid() AND r.name = 'TRANSPORT_ADMIN'
        )
    );
