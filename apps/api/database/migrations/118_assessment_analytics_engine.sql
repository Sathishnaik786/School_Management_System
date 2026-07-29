-- ==================================================
-- Migration: 118_assessment_analytics_engine.sql
-- Bounded Context: Assessment Platform — Analytics, Accreditation & QA Engine
-- ==================================================

BEGIN;

-- 1. ANALYTICS TIME-SERIES SNAPSHOTS
CREATE TABLE IF NOT EXISTS public.assessment_analytics_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    snapshot_date DATE DEFAULT CURRENT_DATE NOT NULL,
    snapshot_type TEXT NOT NULL CHECK (snapshot_type IN ('DAILY', 'WEEKLY', 'MONTHLY', 'SEMESTER', 'ACADEMIC_YEAR')),
    academic_year_id UUID NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. DENORMALIZED ITEM & QUESTION STATISTICS WAREHOUSE
CREATE TABLE IF NOT EXISTS public.assessment_question_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_snapshot_id UUID NOT NULL,
    facility_value NUMERIC(4,2) NOT NULL DEFAULT 0.00,
    difficulty_index NUMERIC(4,2) NOT NULL DEFAULT 0.00,
    discrimination_index NUMERIC(4,2) NOT NULL DEFAULT 0.00,
    skipped_pct NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    average_time_spent_seconds INT NOT NULL DEFAULT 0,
    median_marks NUMERIC(6,2) NOT NULL DEFAULT 0.00,
    standard_deviation NUMERIC(6,2) NOT NULL DEFAULT 0.00,
    bloom_attainment_pct NUMERIC(5,2) NOT NULL DEFAULT 100.00,
    outcome_attainment_pct NUMERIC(5,2) NOT NULL DEFAULT 100.00,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 3. SUBJECT-WISE WAREHOUSE
CREATE TABLE IF NOT EXISTS public.assessment_subject_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID NOT NULL,
    academic_year_id UUID NOT NULL,
    pass_pct NUMERIC(5,2) NOT NULL DEFAULT 100.00,
    average_gpa NUMERIC(4,2) NOT NULL DEFAULT 0.00,
    enrolled_count INT NOT NULL DEFAULT 0,
    highest_score NUMERIC(6,2) NOT NULL DEFAULT 0.00,
    lowest_score NUMERIC(6,2) NOT NULL DEFAULT 0.00,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 4. EXAM-WISE AGGREGATED STATS
CREATE TABLE IF NOT EXISTS public.assessment_exam_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID NOT NULL,
    total_candidates INT NOT NULL DEFAULT 0,
    absent_count INT NOT NULL DEFAULT 0,
    passed_count INT NOT NULL DEFAULT 0,
    failed_count INT NOT NULL DEFAULT 0,
    class_average NUMERIC(6,2) NOT NULL DEFAULT 0.00,
    class_median NUMERIC(6,2) NOT NULL DEFAULT 0.00,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 5. DEPARTMENT COHORT COMPARISONS
CREATE TABLE IF NOT EXISTS public.assessment_department_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_id UUID NOT NULL,
    academic_year_id UUID NOT NULL,
    average_gpa NUMERIC(4,2) NOT NULL DEFAULT 0.00,
    retention_rate_pct NUMERIC(5,2) NOT NULL DEFAULT 100.00,
    backlog_ratio_pct NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 6. COURSE OUTCOMES (CO) ATTAINMENT
CREATE TABLE IF NOT EXISTS public.assessment_co_attainment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    subject_id UUID NOT NULL,
    co_code TEXT NOT NULL,
    attainment_target_pct NUMERIC(5,2) NOT NULL DEFAULT 70.00,
    actual_attainment_pct NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL CHECK (status IN ('MET', 'NOT_MET')) DEFAULT 'NOT_MET',
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 7. PROGRAM OUTCOMES (PO) ATTAINMENT
CREATE TABLE IF NOT EXISTS public.assessment_po_attainment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    po_code TEXT NOT NULL,
    attainment_score NUMERIC(4,2) NOT NULL DEFAULT 0.00,
    target_score NUMERIC(4,2) NOT NULL DEFAULT 3.00,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 8. BLOOM'S TAXONOMY ANALYTICS
CREATE TABLE IF NOT EXISTS public.assessment_bloom_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    bloom_level TEXT NOT NULL CHECK (bloom_level IN ('REMEMBER', 'UNDERSTAND', 'APPLY', 'ANALYZE', 'EVALUATE', 'CREATE')),
    questions_count INT NOT NULL DEFAULT 0,
    average_marks_pct NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 9. QUALITY AUDITS DESK
CREATE TABLE IF NOT EXISTS public.assessment_quality_audits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    audited_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    audit_date DATE DEFAULT CURRENT_DATE NOT NULL,
    checklist_status_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_compliant BOOLEAN NOT NULL DEFAULT true,
    remarks TEXT
);

-- 10. ACCREDITATION NBA/NAAC TEMPLATES
CREATE TABLE IF NOT EXISTS public.assessment_accreditation_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    report_type TEXT NOT NULL CHECK (report_type IN ('NBA', 'NAAC', 'ABET', 'AACSB', 'NIRF')),
    generated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    attainment_metrics_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 11. YEAR-OVER-YEAR BENCHMARKS
CREATE TABLE IF NOT EXISTS public.assessment_benchmark_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    academic_year_id UUID NOT NULL,
    comparison_year_id UUID NOT NULL,
    gpa_delta NUMERIC(4,2) NOT NULL DEFAULT 0.00,
    improvement_areas TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 12. PREDICTOR ML MODELS METADATA STUBS
CREATE TABLE IF NOT EXISTS public.assessment_prediction_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_name TEXT NOT NULL,
    version_label TEXT NOT NULL,
    accuracy_score NUMERIC(4,2) NOT NULL DEFAULT 1.00,
    features_json JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- 13. STUDENT DROPOUT RISK PREDICTION SCORES
CREATE TABLE IF NOT EXISTS public.assessment_student_risk_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL,
    risk_level TEXT NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
    risk_score NUMERIC(4,2) NOT NULL DEFAULT 0.00, -- 0.00 to 1.00 index
    factors TEXT[],
    predicted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 14. LEARNING GAP ANALYTICS AND REMEDIALS
CREATE TABLE IF NOT EXISTS public.assessment_learning_gap_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL,
    subject_id UUID NOT NULL,
    gap_description TEXT NOT NULL,
    remedial_class_recommended BOOLEAN NOT NULL DEFAULT false,
    remedial_status TEXT NOT NULL CHECK (remedial_status IN ('PENDING', 'ASSIGNED', 'COMPLETED')) DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 15. PDF REPORTS EXPORT CACHE
CREATE TABLE IF NOT EXISTS public.assessment_report_exports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    format TEXT NOT NULL CHECK (format IN ('PDF', 'EXCEL', 'CSV', 'JSON', 'PPT')),
    report_type TEXT NOT NULL CHECK (report_type IN ('question_analysis', 'bloom_taxonomy', 'co_attainment', 'accreditation')),
    file_path TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 16. PRE-RENDERED DASHBOARD JSON CACHE
CREATE TABLE IF NOT EXISTS public.assessment_dashboard_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    role_key TEXT NOT NULL, -- PRINCIPAL, DEAN, HOD, FACULTY
    cache_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Row Level Security
ALTER TABLE public.assessment_analytics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_co_attainment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_po_attainment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_bloom_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_accreditation_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_quality_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_dashboard_cache ENABLE ROW LEVEL SECURITY;

-- Tenant Policies
CREATE POLICY "Tenant select snapshots" ON public.assessment_analytics_snapshots FOR SELECT TO authenticated USING (
    school_id = public.get_my_school_id()
);
CREATE POLICY "Admin manage snapshots" ON public.assessment_analytics_snapshots FOR ALL TO authenticated USING (
    school_id = public.get_my_school_id()
);

CREATE POLICY "Tenant select attainments" ON public.assessment_co_attainment FOR SELECT TO authenticated USING (
    school_id = public.get_my_school_id()
);
CREATE POLICY "Admin manage attainments" ON public.assessment_co_attainment FOR ALL TO authenticated USING (
    school_id = public.get_my_school_id()
);

CREATE POLICY "Tenant select accr reports" ON public.assessment_accreditation_reports FOR SELECT TO authenticated USING (
    school_id = public.get_my_school_id()
);
CREATE POLICY "Admin manage accr reports" ON public.assessment_accreditation_reports FOR ALL TO authenticated USING (
    school_id = public.get_my_school_id()
);

COMMIT;
