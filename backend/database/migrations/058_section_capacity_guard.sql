-- =======================================================
-- MIGRATION: 058_section_capacity_guard
-- DESCRIPTION: Enforces max 15 students per section per year.
-- =======================================================

-- 1. Add Unique Constraint to student_sections to ensure 1 section per year
-- (In case it's missing or only on student_id, section_id)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uni_student_year_section') THEN
        ALTER TABLE public.student_sections 
        ADD CONSTRAINT uni_student_year_section UNIQUE (student_id, academic_year_id);
    END IF;
END $$;

-- 2. RPC for Transactional Assignment with Capacity Guard
CREATE OR REPLACE FUNCTION public.fn_assign_student_with_capacity_guard(
    p_student_id UUID,
    p_section_id UUID,
    p_academic_year_id UUID,
    p_max_capacity INTEGER DEFAULT 15
) RETURNS VOID AS $$
DECLARE
    current_count INTEGER;
BEGIN
    -- 1. Check Capacity
    SELECT count(*) INTO current_count
    FROM public.student_sections
    WHERE section_id = p_section_id
      AND academic_year_id = p_academic_year_id;
      
    IF current_count >= p_max_capacity THEN
        RAISE EXCEPTION 'SECTION_FULL: Section capacity of % reached.', p_max_capacity;
    END IF;
    
    -- 2. Upsert (Handles relocation within same year)
    INSERT INTO public.student_sections (student_id, section_id, academic_year_id)
    VALUES (p_student_id, p_section_id, p_academic_year_id)
    ON CONFLICT (student_id, academic_year_id) 
    DO UPDATE SET section_id = p_section_id, assigned_at = NOW();
    
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Atomic Auto-Distribution RPC
CREATE OR REPLACE FUNCTION public.fn_auto_distribute_class(
    p_school_id UUID,
    p_class_id UUID,
    p_academic_year_id UUID,
    p_performed_by UUID
) RETURNS JSONB AS $$
DECLARE
    v_class_name TEXT;
    v_section_a_id UUID;
    v_section_b_id UUID;
    v_student RECORD;
    v_index INTEGER := 0;
    v_success_a INTEGER := 0;
    v_success_b INTEGER := 0;
BEGIN
    -- 1. Get Class Name and Sections
    SELECT name INTO v_class_name FROM public.classes WHERE id = p_class_id AND school_id = p_school_id;
    IF v_class_name IS NULL THEN RAISE EXCEPTION 'Class not found'; END IF;

    SELECT id INTO v_section_a_id FROM public.sections WHERE class_id = p_class_id ORDER BY name LIMIT 1;
    SELECT id INTO v_section_b_id FROM public.sections WHERE class_id = p_class_id ORDER BY name LIMIT 1 OFFSET 1;
    
    IF v_section_a_id IS NULL OR v_section_b_id IS NULL THEN
        RAISE EXCEPTION 'Class must have at least 2 sections (A, B)';
    END IF;

    -- 2. Iterate through unassigned students for this class
    FOR v_student IN 
        SELECT s.id, s.student_code, s.admission_id
        FROM public.students s
        JOIN public.admissions a ON s.admission_id = a.id
        WHERE s.school_id = p_school_id
          AND a.academic_year_id = p_academic_year_id
          AND a.grade_applied_for = v_class_name
          AND NOT EXISTS (
              SELECT 1 FROM public.student_sections ss 
              WHERE ss.student_id = s.id AND ss.academic_year_id = p_academic_year_id
          )
        ORDER BY s.student_code
    LOOP
        v_index := v_index + 1;
        
        IF v_index <= 15 THEN
            -- Assign to A
            INSERT INTO public.student_sections (student_id, section_id, academic_year_id)
            VALUES (v_student.id, v_section_a_id, p_academic_year_id);
            v_success_a := v_success_a + 1;
        ELSIF v_index <= 30 THEN
            -- Assign to B
            INSERT INTO public.student_sections (student_id, section_id, academic_year_id)
            VALUES (v_student.id, v_section_b_id, p_academic_year_id);
            v_success_b := v_success_b + 1;
        ELSE
            RAISE EXCEPTION 'CLASS_FULL: More than 30 students found for class %. Automation stopped.', v_class_name;
        END IF;

        -- Log individual (optional but required by "all assignments logged")
        IF v_student.admission_id IS NOT NULL THEN
            INSERT INTO public.admission_audit_logs (admission_id, action, performed_by, remarks)
            VALUES (v_student.admission_id, 'CLASS_ASSIGNED', p_performed_by, 'Auto-distributed to section');
        END IF;
    END LOOP;

    -- 3. Global Log
    INSERT INTO public.academic_automation_logs (school_id, action, details, performed_by)
    VALUES (p_school_id, 'AUTO_DISTRIBUTION', jsonb_build_object('class', v_class_name, 'total', v_index), p_performed_by);

    RETURN jsonb_build_object('success', true, 'total', v_index, 'sectionA', v_success_a, 'sectionB', v_success_b);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
