-- Add created_by column to exams
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- Enable RLS for exams if not already
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

-- Policy: Faculty can create exams
-- (Usually handled by INSERT policy, but we need to check permissions)
-- We will handle permission 'EXAM_CREATE' in middleware, but RLS must allow insert.

CREATE POLICY "Faculty create exams" ON public.exams
    FOR INSERT WITH CHECK (
        auth.uid() = created_by AND 
        EXISTS (
             SELECT 1 FROM public.user_roles ur
             JOIN public.roles r ON ur.role_id = r.id
             WHERE ur.user_id = auth.uid() AND r.name = 'FACULTY'
        )
    );

-- Policy: Faculty update own exams
CREATE POLICY "Faculty update own exams" ON public.exams
    FOR UPDATE USING (
        created_by = auth.uid()
    );

-- Policy: Faculty delete own exams
CREATE POLICY "Faculty delete own exams" ON public.exams
    FOR DELETE USING (
        created_by = auth.uid()
    );

-- Policy: Faculty view all exams (to choose for marks entry)
-- Existing "School users view exams" handles SELECT for school_id.
-- That usually covers faculty viewing all exams. 
-- We don't need to change SELECT unless we want to HIDE admin exams from faculty?
-- User said: "wont distub school exams".
-- Interpretation: Faculty can see them, but not edit them.
-- If Faculty creates "Quiz 1", Admin sees it? Yes, Admin usually sees all.

