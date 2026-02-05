-- 044_extend_import_jobs_entity_type.sql
-- Extend entity_type CHECK constraint to support new import types

ALTER TABLE public.import_jobs
DROP CONSTRAINT IF EXISTS import_jobs_entity_type_check;

ALTER TABLE public.import_jobs
ADD CONSTRAINT import_jobs_entity_type_check
CHECK (
    entity_type IN (
        'STUDENT',
        'FACULTY',
        'DRIVER',
        'VEHICLE',
        'DRIVER_VEHICLE_MAP',
        'SUBJECT',
        'FACULTY_PROFILE',
        'STAFF_PROFILE'
    )
);
