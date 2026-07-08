-- ==================================================
-- Migration: 107_assessment_platform_rbac_permissions.sql
-- Purpose:   Seed Assessment Platform permissions into RBAC tables
--            and assign them to EXAM_CELL_ADMIN and ADMIN roles.
--
-- This remediation migration was missing from Phases 1-3.
-- Permissions were defined in permissions.ts but were never inserted
-- into the Supabase `permissions` table or linked to roles.
-- ==================================================

BEGIN;

-- -------------------------------------------------------
-- 1. INSERT PERMISSIONS (idempotent via ON CONFLICT)
-- -------------------------------------------------------
INSERT INTO public.permissions (code, description) VALUES
    -- Phase 1: Foundation
    ('assessment.config.view',      'View Assessment Platform configuration and workflow settings'),
    ('assessment.config.manage',    'Create and update Assessment Platform configuration'),
    ('assessment.workflow.manage',  'Create, update, and publish assessment workflow definitions'),

    -- Phase 2: Question Bank
    ('assessment.question.view',    'View questions in the Question Bank'),
    ('assessment.question.manage',  'Create, edit, and delete questions in the Question Bank'),
    ('assessment.question.import',  'Import questions in bulk via CSV into the Question Bank'),

    -- Phase 3: Template Builder
    ('assessment.template.view',    'View assessment templates'),
    ('assessment.template.manage',  'Create and update assessment templates'),
    ('assessment.template.publish', 'Publish and version-lock assessment templates')
ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description;

-- -------------------------------------------------------
-- 2. ASSIGN PERMISSIONS TO EXAM_CELL_ADMIN ROLE
-- -------------------------------------------------------
DO $$
DECLARE
    v_exam_cell_admin_id UUID;
    v_admin_id           UUID;
BEGIN
    -- Fetch role IDs (they must exist from migration 001_rbac_core.sql)
    SELECT id INTO v_exam_cell_admin_id FROM public.roles WHERE name = 'EXAM_CELL_ADMIN';
    SELECT id INTO v_admin_id           FROM public.roles WHERE name = 'ADMIN';

    IF v_exam_cell_admin_id IS NULL THEN
        RAISE WARNING '[107] EXAM_CELL_ADMIN role not found. Skipping permission assignment for that role.';
    END IF;

    IF v_admin_id IS NULL THEN
        RAISE WARNING '[107] ADMIN role not found. Skipping permission assignment for ADMIN.';
    END IF;

    -- Assign all Assessment Platform permissions to EXAM_CELL_ADMIN
    IF v_exam_cell_admin_id IS NOT NULL THEN
        INSERT INTO public.role_permissions (role_id, permission_id)
        SELECT v_exam_cell_admin_id, p.id
        FROM public.permissions p
        WHERE p.code IN (
            'assessment.config.view',
            'assessment.config.manage',
            'assessment.workflow.manage',
            'assessment.question.view',
            'assessment.question.manage',
            'assessment.question.import',
            'assessment.template.view',
            'assessment.template.manage',
            'assessment.template.publish'
        )
        ON CONFLICT DO NOTHING;

        RAISE NOTICE '[107] Assessment Platform permissions assigned to EXAM_CELL_ADMIN.';
    END IF;

    -- Assign all Assessment Platform permissions to ADMIN as well
    IF v_admin_id IS NOT NULL THEN
        INSERT INTO public.role_permissions (role_id, permission_id)
        SELECT v_admin_id, p.id
        FROM public.permissions p
        WHERE p.code IN (
            'assessment.config.view',
            'assessment.config.manage',
            'assessment.workflow.manage',
            'assessment.question.view',
            'assessment.question.manage',
            'assessment.question.import',
            'assessment.template.view',
            'assessment.template.manage',
            'assessment.template.publish'
        )
        ON CONFLICT DO NOTHING;

        RAISE NOTICE '[107] Assessment Platform permissions assigned to ADMIN.';
    END IF;
END $$;

-- -------------------------------------------------------
-- 3. ALSO ASSIGN TO EXAM_CELL ROLE (alias of EXAM_CELL_ADMIN)
-- -------------------------------------------------------
DO $$
DECLARE
    v_exam_cell_id UUID;
BEGIN
    SELECT id INTO v_exam_cell_id FROM public.roles WHERE name = 'EXAM_CELL';

    IF v_exam_cell_id IS NOT NULL THEN
        INSERT INTO public.role_permissions (role_id, permission_id)
        SELECT v_exam_cell_id, p.id
        FROM public.permissions p
        WHERE p.code IN (
            'assessment.config.view',
            'assessment.question.view',
            'assessment.template.view'
        )
        ON CONFLICT DO NOTHING;

        RAISE NOTICE '[107] Read-level Assessment Platform permissions assigned to EXAM_CELL.';
    END IF;
END $$;

COMMIT;
