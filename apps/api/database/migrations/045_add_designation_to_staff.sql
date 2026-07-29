-- Migration to add designation column to staff_profiles
ALTER TABLE IF EXISTS public.staff_profiles 
ADD COLUMN IF NOT EXISTS designation TEXT;
