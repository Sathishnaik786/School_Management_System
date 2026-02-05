-- Add seed data for Admission Module testing
-- 1. Ensure at least one school exists
-- 1. School
INSERT INTO public.schools (id, name, code, status)
VALUES (
  '457bbda3-f542-47dc-9d41-3d7729226f86',
  'Apex International School',
  'APEX',
  'active'
)
ON CONFLICT (id) DO NOTHING;

-- 2. Academic Year
INSERT INTO public.academic_years (id, school_id, year_label, is_active)
VALUES (
  '8db7f474-3252-475a-bc84-9092be0f8f12',
  '457bbda3-f542-47dc-9d41-3d7729226f86',
  '2026-27',
  true
)
ON CONFLICT (id) DO NOTHING;
