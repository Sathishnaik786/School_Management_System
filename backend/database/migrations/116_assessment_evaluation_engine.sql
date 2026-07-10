-- ==================================================
-- Migration: 116_assessment_evaluation_engine.sql
-- Bounded Context: Assessment Platform — Evaluation & Grading Engine
-- ==================================================

BEGIN;

-- 1. EVALUATION ASSIGNMENTS
CREATE TABLE IF NOT EXISTS public.assessment_evaluation_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    evaluator_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
    published_paper_id UUID NOT NULL,
    workload_limit INT NOT NULL DEFAULT 50 CHECK (workload_limit > 0),
    priority TEXT NOT NULL CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')) DEFAULT 'MEDIUM',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. EVALUATION SESSIONS
CREATE TABLE IF NOT EXISTS public.assessment_evaluation_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    assignment_id UUID REFERENCES public.assessment_evaluation_assignments(id) ON DELETE SET NULL,
    published_paper_id UUID NOT NULL,
    attempt_id UUID NOT NULL,
    evaluator_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status TEXT NOT NULL CHECK (status IN ('DRAFT', 'AUTO_GRADED', 'UNDER_EVALUATION', 'UNDER_MODERATION', 'RE_EVALUATION', 'FINALIZED', 'PUBLISHED', 'LOCKED')) DEFAULT 'DRAFT',
    anonymous_mode BOOLEAN NOT NULL DEFAULT true,
    moderation_required BOOLEAN NOT NULL DEFAULT false,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 3. EVALUATION LOCK TABLE
CREATE TABLE IF NOT EXISTS public.assessment_evaluation_locks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evaluation_session_id UUID REFERENCES public.assessment_evaluation_sessions(id) ON DELETE CASCADE NOT NULL,
    evaluator_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    locked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    device_id TEXT
);

-- 4. QUESTION EVALUATIONS
CREATE TABLE IF NOT EXISTS public.assessment_question_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.assessment_evaluation_sessions(id) ON DELETE CASCADE NOT NULL,
    question_snapshot_id UUID NOT NULL,
    awarded_marks NUMERIC(6,2) NOT NULL DEFAULT 0.00 CHECK (awarded_marks >= 0),
    maximum_marks NUMERIC(6,2) NOT NULL CHECK (maximum_marks > 0),
    remarks TEXT,
    evaluator_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 5. COORDINATE-BASED ANNOTATIONS
CREATE TABLE IF NOT EXISTS public.assessment_evaluation_annotations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_evaluation_id UUID REFERENCES public.assessment_question_evaluations(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Highlight', 'Rectangle', 'Circle', 'Arrow', 'Strike', 'Underline', 'Sticky Note', 'Text Comment', 'Drawing', 'Freehand Pen')),
    coordinates JSONB NOT NULL DEFAULT '{}'::jsonb, -- X, Y, W, H, path coords
    comment_text TEXT,
    annotated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 6. RUBRIC TEMPLATES
CREATE TABLE IF NOT EXISTS public.assessment_rubric_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 7. RUBRICS INSTANCES
CREATE TABLE IF NOT EXISTS public.assessment_rubrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    template_id UUID REFERENCES public.assessment_rubric_templates(id) ON DELETE SET NULL,
    question_snapshot_id UUID NOT NULL,
    total_score NUMERIC(6,2) NOT NULL DEFAULT 100.00
);

-- 8. RUBRIC CRITERIA
CREATE TABLE IF NOT EXISTS public.assessment_rubric_criteria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rubric_id UUID REFERENCES public.assessment_rubrics(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    weight NUMERIC(4,2) NOT NULL DEFAULT 1.00 CHECK (weight > 0),
    description TEXT,
    criteria_levels JSONB NOT NULL DEFAULT '[]'::jsonb -- Score thresholds options
);

-- 9. MODERATION QUEUE
CREATE TABLE IF NOT EXISTS public.assessment_moderation_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.assessment_evaluation_sessions(id) ON DELETE CASCADE NOT NULL,
    first_evaluator_marks NUMERIC(6,2) NOT NULL,
    second_evaluator_marks NUMERIC(6,2) NOT NULL,
    variance_pct NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    moderator_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    moderator_marks NUMERIC(6,2),
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'RESOLVED', 'REJECTED')) DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 10. REVALUATION REQUESTS
CREATE TABLE IF NOT EXISTS public.assessment_revaluation_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_id UUID NOT NULL,
    student_id UUID NOT NULL,
    fee_verified BOOLEAN NOT NULL DEFAULT false,
    reason TEXT,
    status TEXT NOT NULL CHECK (status IN ('REQUESTED', 'APPROVED', 'RE_EVALUATING', 'COMPLETED', 'REJECTED')) DEFAULT 'REQUESTED',
    decision_remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 11. GRACE RULES POLICIES
CREATE TABLE IF NOT EXISTS public.assessment_grace_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
    policy_name TEXT NOT NULL,
    grace_marks_limit NUMERIC(4,2) NOT NULL DEFAULT 5.00 CHECK (grace_marks_limit >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- 12. GRADE CALCULATIONS MASTER
CREATE TABLE IF NOT EXISTS public.assessment_grade_calculations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    attempt_id UUID NOT NULL,
    raw_marks NUMERIC(6,2) NOT NULL DEFAULT 0.00,
    scaled_marks NUMERIC(6,2) NOT NULL DEFAULT 0.00,
    grace_marks NUMERIC(6,2) NOT NULL DEFAULT 0.00,
    final_marks NUMERIC(6,2) NOT NULL DEFAULT 0.00,
    grade_label TEXT NOT NULL,
    grade_point NUMERIC(4,2) NOT NULL DEFAULT 0.00,
    credits INT NOT NULL DEFAULT 0,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 13. GRADE CALCULATION HISTORY LOGS
CREATE TABLE IF NOT EXISTS public.assessment_grade_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    calculation_id UUID REFERENCES public.assessment_grade_calculations(id) ON DELETE CASCADE NOT NULL,
    raw_marks NUMERIC(6,2) NOT NULL,
    final_marks NUMERIC(6,2) NOT NULL,
    grade_label TEXT NOT NULL,
    changed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    change_reason TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 14. ITEM AND QUESTION STATISTICS
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

-- 15. AI EVALUATION QUEUE HOOK
CREATE TABLE IF NOT EXISTS public.assessment_ai_evaluation_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_id UUID NOT NULL,
    question_snapshot_id UUID NOT NULL,
    model_name TEXT NOT NULL,
    prompt_version TEXT NOT NULL,
    confidence_score NUMERIC(4,2) NOT NULL DEFAULT 1.00,
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'PROCESSED', 'FAILED')) DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 16. EVALUATION MUTATION LOGS AUDIT TRAIL
CREATE TABLE IF NOT EXISTS public.assessment_evaluation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.assessment_evaluation_sessions(id) ON DELETE CASCADE NOT NULL,
    action TEXT NOT NULL,
    before_state JSONB NOT NULL DEFAULT '{}'::jsonb,
    after_state JSONB NOT NULL DEFAULT '{}'::jsonb,
    evaluator_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Row Level Security
ALTER TABLE public.assessment_evaluation_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_evaluation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_evaluation_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_question_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_evaluation_annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_rubric_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_rubrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_rubric_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_moderation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_revaluation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_grace_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_grade_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_grade_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_question_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_ai_evaluation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_evaluation_logs ENABLE ROW LEVEL SECURITY;

-- Tenant Policy mappings
CREATE POLICY "Tenant select assignments" ON public.assessment_evaluation_assignments FOR SELECT TO authenticated USING (
    school_id = public.get_my_school_id()
);
CREATE POLICY "Admin manage assignments" ON public.assessment_evaluation_assignments FOR ALL TO authenticated USING (
    school_id = public.get_my_school_id()
);

CREATE POLICY "Tenant select sessions" ON public.assessment_evaluation_sessions FOR SELECT TO authenticated USING (
    school_id = public.get_my_school_id()
);
CREATE POLICY "Admin manage sessions" ON public.assessment_evaluation_sessions FOR ALL TO authenticated USING (
    school_id = public.get_my_school_id()
);

CREATE POLICY "Tenant select templates" ON public.assessment_rubric_templates FOR SELECT TO authenticated USING (
    school_id = public.get_my_school_id()
);
CREATE POLICY "Admin manage templates" ON public.assessment_rubric_templates FOR ALL TO authenticated USING (
    school_id = public.get_my_school_id()
);

CREATE POLICY "Tenant select calculations" ON public.assessment_grade_calculations FOR SELECT TO authenticated USING (
    school_id = public.get_my_school_id()
);
CREATE POLICY "Admin manage calculations" ON public.assessment_grade_calculations FOR ALL TO authenticated USING (
    school_id = public.get_my_school_id()
);

COMMIT;
