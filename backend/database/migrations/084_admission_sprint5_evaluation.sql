-- ==================================================
-- 084_admission_sprint5_evaluation.sql
-- Phase 3 Sprint 5 Evaluation, Exams, Interviews & Offer Letters
-- ==================================================

BEGIN;

-- 1. EXAM TEMPLATES TABLE
CREATE TABLE IF NOT EXISTS public.admission_exam_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    grade TEXT UNIQUE NOT NULL,
    duration INT NOT NULL, -- minutes
    total_marks INT NOT NULL,
    passing_marks INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed Exam Templates
INSERT INTO public.admission_exam_templates (name, grade, duration, total_marks, passing_marks) VALUES
('Nursery Aptitude Exam', 'Nursery', 60, 50, 20),
('LKG Entrance Assessment', 'LKG', 60, 50, 20),
('UKG Entrance Assessment', 'UKG', 90, 100, 40),
('Grade 1 Entrance Exam', 'Grade 1', 120, 100, 40)
ON CONFLICT (grade) DO UPDATE SET
    name = EXCLUDED.name,
    duration = EXCLUDED.duration,
    total_marks = EXCLUDED.total_marks,
    passing_marks = EXCLUDED.passing_marks;

-- 2. EXAM SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS public.admission_exam_subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES public.admission_exam_templates(id) ON DELETE CASCADE NOT NULL,
    subject_name TEXT NOT NULL,
    max_marks INT NOT NULL,
    weightage INT NOT NULL, -- percentage of overall exam
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_subject_template UNIQUE (template_id, subject_name)
);

-- Seed Default Subjects
-- For UKG
INSERT INTO public.admission_exam_subjects (template_id, subject_name, max_marks, weightage)
SELECT id, 'English', 50, 50 FROM public.admission_exam_templates WHERE grade = 'UKG'
ON CONFLICT (template_id, subject_name) DO NOTHING;
INSERT INTO public.admission_exam_subjects (template_id, subject_name, max_marks, weightage)
SELECT id, 'Mathematics', 50, 50 FROM public.admission_exam_templates WHERE grade = 'UKG'
ON CONFLICT (template_id, subject_name) DO NOTHING;

-- For Grade 1
INSERT INTO public.admission_exam_subjects (template_id, subject_name, max_marks, weightage)
SELECT id, 'English Reading & Writing', 50, 50 FROM public.admission_exam_templates WHERE grade = 'Grade 1'
ON CONFLICT (template_id, subject_name) DO NOTHING;
INSERT INTO public.admission_exam_subjects (template_id, subject_name, max_marks, weightage)
SELECT id, 'Elementary Arithmetic', 50, 50 FROM public.admission_exam_templates WHERE grade = 'Grade 1'
ON CONFLICT (template_id, subject_name) DO NOTHING;

-- 3. EXAM SESSION SCHEDULE TABLE
CREATE TABLE IF NOT EXISTS public.admission_exam_schedule (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES public.admission_exam_templates(id) ON DELETE CASCADE NOT NULL,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
    room_name TEXT NOT NULL,
    invigilator_name TEXT NOT NULL,
    exam_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'SCHEDULED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. EXAM SESSION CANDIDATES ALLOCATION TABLE
CREATE TABLE IF NOT EXISTS public.admission_exam_session_candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.admission_exam_schedule(id) ON DELETE CASCADE NOT NULL,
    application_id UUID REFERENCES public.admission_applications(id) ON DELETE CASCADE NOT NULL,
    hall_ticket_number TEXT UNIQUE NOT NULL,
    seat_number TEXT,
    attendance_status TEXT NOT NULL DEFAULT 'PENDING',
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_session_candidate UNIQUE (session_id, application_id)
);

-- 5. EXAM RESULTS DETAILED TABLE
CREATE TABLE IF NOT EXISTS public.admission_exam_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID REFERENCES public.admission_exam_session_candidates(id) ON DELETE CASCADE NOT NULL,
    subject_id UUID REFERENCES public.admission_exam_subjects(id) ON DELETE CASCADE NOT NULL,
    marks_obtained NUMERIC NOT NULL,
    percentage NUMERIC NOT NULL,
    pass BOOLEAN NOT NULL,
    evaluator_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_candidate_subject UNIQUE (candidate_id, subject_id)
);

-- 6. INTERVIEW PANELS TABLE
CREATE TABLE IF NOT EXISTS public.admission_interview_panels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    panel_name TEXT UNIQUE NOT NULL,
    members TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. INTERVIEWS SCHEDULER TABLE
CREATE TABLE IF NOT EXISTS public.admission_interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES public.admission_applications(id) ON DELETE CASCADE NOT NULL,
    panel_id UUID REFERENCES public.admission_interview_panels(id) ON DELETE RESTRICT NOT NULL,
    interview_date TIMESTAMP WITH TIME ZONE NOT NULL,
    room_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'SCHEDULED',
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_app_interview UNIQUE (application_id)
);

-- 8. INTERVIEW CRITERIA RUBRICS TABLE
CREATE TABLE IF NOT EXISTS public.admission_interview_criteria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    max_score INT NOT NULL DEFAULT 10,
    weightage INT NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed Interview Criteria
INSERT INTO public.admission_interview_criteria (code, name, max_score, weightage) VALUES
('communication', 'Communication & Language', 10, 20),
('confidence', 'Confidence & Articulation', 10, 20),
('knowledge', 'General Awareness & Reasoning', 10, 20),
('behavior', 'Behavior & Interaction', 10, 20),
('discipline', 'Discipline & Attentiveness', 10, 20)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    weightage = EXCLUDED.weightage;

-- 9. INTERVIEW CRITERION MARKS TABLE
CREATE TABLE IF NOT EXISTS public.admission_interview_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interview_id UUID REFERENCES public.admission_interviews(id) ON DELETE CASCADE NOT NULL,
    criterion_id UUID REFERENCES public.admission_interview_criteria(id) ON DELETE RESTRICT NOT NULL,
    score NUMERIC NOT NULL,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_interview_criterion UNIQUE (interview_id, criterion_id)
);

-- 10. CONFIGURABLE MERIT RULES TABLE
CREATE TABLE IF NOT EXISTS public.admission_merit_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
    tie_breaker_rules JSONB NOT NULL DEFAULT '["Exam Score", "Interview Score", "Age", "Application Date"]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_merit_rule UNIQUE (school_id, academic_year_id)
);

-- 11. DYNAMIC MERIT WEIGHTAGE COMPONENTS
CREATE TABLE IF NOT EXISTS public.admission_merit_components (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_id UUID REFERENCES public.admission_merit_rules(id) ON DELETE CASCADE NOT NULL,
    component_name TEXT NOT NULL, -- 'Exam', 'Interview', 'Sports', 'Sibling', 'Alumni'
    weight INT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_rule_component UNIQUE (rule_id, component_name)
);

-- 12. FINAL MERIT SCORES & WAITLIST SELECTION RESULTS
CREATE TABLE IF NOT EXISTS public.admission_merit_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES public.admission_applications(id) ON DELETE CASCADE UNIQUE NOT NULL,
    final_score NUMERIC NOT NULL,
    rank INT NOT NULL,
    selection_status TEXT NOT NULL, -- 'SELECTED', 'WAITLISTED', 'RESERVED', 'REJECTED'
    waitlist_priority INT,
    waitlist_group TEXT,
    recommendation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. OFFER LETTER DOCUMENT TEMPLATES
CREATE TABLE IF NOT EXISTS public.admission_offer_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    content_body TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed Default Offer Letter Template
INSERT INTO public.admission_offer_templates (name, content_body) VALUES
('Standard Admission Offer Letter', 'Dear Parent, We are pleased to offer your ward admission to school. Please verify documents and complete payments before expiry.')
ON CONFLICT (name) DO NOTHING;

-- 14. ADMISSION OFFER LETTERS INDEX
CREATE TABLE IF NOT EXISTS public.admission_offer_letters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES public.admission_applications(id) ON DELETE CASCADE UNIQUE NOT NULL,
    offer_number TEXT UNIQUE NOT NULL,
    template_id UUID REFERENCES public.admission_offer_templates(id) ON DELETE RESTRICT NOT NULL,
    issue_date DATE NOT NULL,
    acceptance_date DATE,
    expiry_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'GENERATED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. WAITLIST AUTO PROMOTIONS LOG
CREATE TABLE IF NOT EXISTS public.admission_waitlist_promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_application_id UUID REFERENCES public.admission_applications(id) ON DELETE CASCADE NOT NULL,
    to_application_id UUID REFERENCES public.admission_applications(id) ON DELETE CASCADE NOT NULL,
    promoted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 16. EXAMS HALL TICKETS REGISTER
CREATE TABLE IF NOT EXISTS public.admission_hall_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES public.admission_applications(id) ON DELETE CASCADE NOT NULL,
    exam_schedule_id UUID REFERENCES public.admission_exam_schedule(id) ON DELETE CASCADE NOT NULL,
    hall_ticket_number TEXT UNIQUE NOT NULL,
    exam_room TEXT NOT NULL,
    reporting_time TIMESTAMP WITH TIME ZONE NOT NULL,
    qr_code_path TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 17. EXAM WORKFLOW RULES
CREATE TABLE IF NOT EXISTS public.exam_workflow_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_status TEXT NOT NULL,
    to_status TEXT NOT NULL,
    role TEXT NOT NULL,
    allowed BOOLEAN DEFAULT true,
    CONSTRAINT unique_exam_workflow UNIQUE (from_status, to_status, role)
);

-- Seed Exam Workflow
INSERT INTO public.exam_workflow_rules (from_status, to_status, role, allowed) VALUES
('SCHEDULED', 'ONGOING', 'invigilator', true),
('SCHEDULED', 'ONGOING', 'admin', true),
('ONGOING', 'COMPLETED', 'invigilator', true),
('ONGOING', 'COMPLETED', 'admin', true),
('COMPLETED', 'EVALUATED', 'evaluator', true),
('COMPLETED', 'EVALUATED', 'admin', true)
ON CONFLICT (from_status, to_status, role) DO UPDATE SET allowed = EXCLUDED.allowed;

-- 18. INTERVIEW WORKFLOW RULES
CREATE TABLE IF NOT EXISTS public.interview_workflow_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_status TEXT NOT NULL,
    to_status TEXT NOT NULL,
    role TEXT NOT NULL,
    allowed BOOLEAN DEFAULT true,
    CONSTRAINT unique_interview_workflow UNIQUE (from_status, to_status, role)
);

-- Seed Interview Workflow
INSERT INTO public.interview_workflow_rules (from_status, to_status, role, allowed) VALUES
('SCHEDULED', 'COMPLETED', 'panel_member', true),
('SCHEDULED', 'COMPLETED', 'admin', true),
('COMPLETED', 'EVALUATED', 'panel_member', true),
('COMPLETED', 'EVALUATED', 'admin', true)
ON CONFLICT (from_status, to_status, role) DO UPDATE SET allowed = EXCLUDED.allowed;

-- 19. OFFER WORKFLOW RULES
CREATE TABLE IF NOT EXISTS public.offer_workflow_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_status TEXT NOT NULL,
    to_status TEXT NOT NULL,
    role TEXT NOT NULL,
    allowed BOOLEAN DEFAULT true,
    CONSTRAINT unique_offer_workflow UNIQUE (from_status, to_status, role)
);

-- Seed Offer Workflow
INSERT INTO public.offer_workflow_rules (from_status, to_status, role, allowed) VALUES
('GENERATED', 'SENT', 'admission_officer', true),
('GENERATED', 'SENT', 'admin', true),
('SENT', 'ACCEPTED', 'parent', true),
('SENT', 'ACCEPTED', 'admin', true),
('SENT', 'EXPIRED', 'system', true),
('SENT', 'EXPIRED', 'admin', true),
('ACCEPTED', 'ENROLLED', 'admission_officer', true),
('ACCEPTED', 'ENROLLED', 'admin', true)
ON CONFLICT (from_status, to_status, role) DO UPDATE SET allowed = EXCLUDED.allowed;

-- 20. SEED NEW EVALUATION FEATURE FLAGS
INSERT INTO public.feature_flags (module, feature_key, enabled, environment, description) VALUES
('admission', 'entrance_exam', true, 'development', 'Allows setting exam templates and schedule'),
('admission', 'interview', true, 'development', 'Allows scheduling panels and grading interviews'),
('admission', 'merit_engine', true, 'development', 'Allows running weighted merit ranking and waitlists'),
('admission', 'offer_management', true, 'development', 'Allows sending and accepting admission offers'),
('admission', 'waitlist', true, 'development', 'Allows waitlist auto-promotion logic')
ON CONFLICT (module, feature_key, environment, tenant_id) DO NOTHING;

-- 21. SEED NEW EVALUATION PERMISSIONS
INSERT INTO public.permissions (code, description) VALUES
('admission.exam.manage', 'Allows scheduling exams and seating allocations'),
('admission.exam.evaluate', 'Allows publishes candidate results'),
('admission.interview.manage', 'Allows scheduling interviews panels'),
('admission.interview.evaluate', 'Allows grading candidates interviews criteria'),
('admission.merit.generate', 'Allows running merit list weight engine calculations'),
('admission.offer.manage', 'Allows generating offer letters templates and details')
ON CONFLICT (code) DO NOTHING;

COMMIT;
