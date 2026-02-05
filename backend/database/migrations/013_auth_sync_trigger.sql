-- ==========================================
-- 13. AUTH SYNC TRIGGER
-- ==========================================
-- This trigger ensures that every user created in Supabase Auth (auth.users)
-- has a corresponding record in our application profile table (public.users).

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
    default_school_id UUID;
BEGIN
    -- Try to get school_id from metadata, or use the first school as a fallback (for testing)
    -- In production, you would require school_id during signup.
    SELECT id INTO default_school_id FROM public.schools LIMIT 1;

    INSERT INTO public.users (id, email, full_name, school_id, status)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', 'New User'),
        COALESCE((new.raw_user_meta_data->>'school_id')::UUID, default_school_id),
        'active'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, public.users.full_name);

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-creating trigger to ensure it's fresh
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_auth_user();

-- Also ensure RLS allows the system to read its own users efficiently
ALTER TABLE public.users FORCE ROW LEVEL SECURITY;
