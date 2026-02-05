-- 1. DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (school_id, name)
);

-- Enable RLS for departments
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- 2. FACULTY_PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.faculty_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    employee_code TEXT,
    designation TEXT,
    qualification TEXT,
    joining_date DATE,
    status TEXT CHECK (status IN ('active', 'inactive', 'on_leave')) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id),
    UNIQUE (employee_code) 
);

-- Enable RLS for faculty_profiles
ALTER TABLE public.faculty_profiles ENABLE ROW LEVEL SECURITY;

-- 3. STAFF_PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.staff_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    staff_type TEXT NOT NULL, -- e.g. 'accountant', 'librarian'
    joining_date DATE,
    status TEXT CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id)
);

-- Enable RLS for staff_profiles
ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;

-- 4. FACULTY_SECTION_SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS public.faculty_section_subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    faculty_profile_id UUID REFERENCES public.faculty_profiles(id) ON DELETE CASCADE NOT NULL,
    section_id UUID REFERENCES public.sections(id) ON DELETE CASCADE NOT NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
    assigned_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (faculty_profile_id, section_id, subject_id)
);

-- Enable RLS for faculty_section_subjects
ALTER TABLE public.faculty_section_subjects ENABLE ROW LEVEL SECURITY;


-- POLICIES (Basic Admin Application)

-- DEPARTMENTS
CREATE POLICY "School users view departments" ON public.departments
    FOR SELECT USING (school_id = public.get_my_school_id());
    
CREATE POLICY "Admin manage departments" ON public.departments
    FOR ALL USING (public.is_admin());

-- FACULTY_PROFILES
CREATE POLICY "School users view faculty profiles" ON public.faculty_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = public.faculty_profiles.user_id 
            AND u.school_id = public.get_my_school_id()
        )
    );

CREATE POLICY "Admin manage faculty profiles" ON public.faculty_profiles
    FOR ALL USING (public.is_admin());

-- STAFF_PROFILES
CREATE POLICY "School users view staff profiles" ON public.staff_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = public.staff_profiles.user_id 
            AND u.school_id = public.get_my_school_id()
        )
    );

CREATE POLICY "Admin manage staff profiles" ON public.staff_profiles
    FOR ALL USING (public.is_admin());

-- FACULTY_SECTION_SUBJECTS
CREATE POLICY "School users view assignments" ON public.faculty_section_subjects
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.sections s
            JOIN public.classes c ON s.class_id = c.id
            WHERE s.id = public.faculty_section_subjects.section_id
            AND c.school_id = public.get_my_school_id()
        )
    );

CREATE POLICY "Admin manage assignments" ON public.faculty_section_subjects
    FOR ALL USING (public.is_admin());
