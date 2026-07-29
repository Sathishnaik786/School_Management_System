// Trigger reload to execute RBAC self-healing seeder
import { app } from './app';
import { env } from './config/env';
import { supabase } from './config/supabase';
import fs from 'fs';
import path from 'path';

const NEW_PERMISSIONS = [
    // Dashboards
    { code: 'admin.dashboard.view', description: 'View general admin dashboard and administrative tools' },
    { code: 'assessment.dashboard.view', description: 'View Assessment Platform dashboard' },
    { code: 'exam.dashboard.view', description: 'View Examination Cell dashboard' },
    { code: 'fees.dashboard.view', description: 'View Finance & Fees dashboard' },
    { code: 'admission.dashboard.view', description: 'View Admissions Desk dashboard' },
    { code: 'transport.dashboard.view', description: 'View Transport & Fleet dashboard' },
    { code: 'faculty.dashboard.view', description: 'View Faculty Portal dashboard' },
    { code: 'student.dashboard.view', description: 'View Student Portal dashboard' },
    { code: 'parent.dashboard.view', description: 'View Parent Portal dashboard' },
    { code: 'driver.dashboard.view', description: 'View Driver Portal dashboard' },
    // Assessment platform namespaces
    { code: 'assessment.foundation.view', description: 'View Assessment foundation configurations' },
    { code: 'assessment.foundation.manage', description: 'Create/edit Assessment configurations & workflows' },
    { code: 'assessment.paper.generate', description: 'Generate exam papers' },
    { code: 'assessment.paper.view', description: 'View generated papers' },
    { code: 'assessment.schedule.manage', description: 'Schedule assessments' },
    { code: 'assessment.schedule.view', description: 'View assessment schedules' },
    { code: 'assessment.attempt.write', description: 'Take assessments / write tests' },
    { code: 'assessment.attempt.view', description: 'View attempts' },
    { code: 'assessment.evaluation.manage', description: 'Grade/evaluate attempts' },
    { code: 'assessment.result.view', description: 'View assessment results' },
    { code: 'assessment.result.publish', description: 'Publish assessment results' },
    { code: 'assessment.analytics.view', description: 'View assessment analytics' },
    { code: 'assessment.settings.view', description: 'View settings' },
    { code: 'assessment.settings.manage', description: 'Update settings' },
    { code: 'assessment.configuration.view', description: 'View assessment configurations' },
    { code: 'assessment.configuration.manage', description: 'Create and update assessment configurations' },
    { code: 'assessment.workflow.view', description: 'View assessment review workflows' },
    { code: 'assessment.workflow.publish', description: 'Publish assessment review workflows' },
    { code: 'assessment.workflow.archive', description: 'Archive assessment review workflows' }
];

const ROLE_PERMISSIONS_MAPPING: Record<string, string[]> = {
    ADMIN: NEW_PERMISSIONS.map(p => p.code),
    SUPERADMIN: NEW_PERMISSIONS.map(p => p.code),
    EXAM_CELL_ADMIN: [
        'exam.dashboard.view',
        'assessment.dashboard.view',
        'assessment.foundation.view',
        'assessment.foundation.manage',
        'assessment.paper.generate',
        'assessment.paper.view',
        'assessment.schedule.manage',
        'assessment.schedule.view',
        'assessment.attempt.write',
        'assessment.attempt.view',
        'assessment.evaluation.manage',
        'assessment.result.view',
        'assessment.result.publish',
        'assessment.analytics.view',
        'assessment.settings.view',
        'assessment.settings.manage',
        'assessment.configuration.view',
        'assessment.configuration.manage',
        'assessment.workflow.view',
        'assessment.workflow.publish',
        'assessment.workflow.archive'
    ],
    EXAM_CELL: [
        'exam.dashboard.view',
        'assessment.dashboard.view',
        'assessment.foundation.view',
        'assessment.paper.view',
        'assessment.schedule.view',
        'assessment.attempt.view',
        'assessment.result.view',
        'assessment.analytics.view',
        'assessment.configuration.view',
        'assessment.workflow.view'
    ],
    EXAM_PLATFORM_ADMIN: [
        'assessment.dashboard.view',
        'assessment.foundation.view',
        'assessment.foundation.manage',
        'assessment.paper.generate',
        'assessment.paper.view',
        'assessment.schedule.manage',
        'assessment.schedule.view',
        'assessment.attempt.write',
        'assessment.attempt.view',
        'assessment.evaluation.manage',
        'assessment.result.view',
        'assessment.result.publish',
        'assessment.analytics.view',
        'assessment.settings.view',
        'assessment.settings.manage',
        'assessment.configuration.view',
        'assessment.configuration.manage',
        'assessment.workflow.view',
        'assessment.workflow.publish',
        'assessment.workflow.archive'
    ],
    FINANCE_OFFICER: ['fees.dashboard.view'],
    ACCOUNTANT: ['fees.dashboard.view'],
    ADMISSION_OFFICER: ['admission.dashboard.view'],
    TRANSPORT_ADMIN: ['transport.dashboard.view'],
    FACULTY: ['faculty.dashboard.view'],
    STUDENT: ['student.dashboard.view'],
    PARENT: ['parent.dashboard.view'],
    BUS_DRIVER: ['driver.dashboard.view'],
    DRIVER: ['driver.dashboard.view']
};

async function runRBACSelfHealing() {
    try {
        console.log("[RBAC Self-Healing] Initiating Database Sync...");

        // 1. Ensure all permissions exist in database
        for (const perm of NEW_PERMISSIONS) {
            await supabase.from('permissions').upsert(perm, { onConflict: 'code' });
        }
        console.log("[RBAC Self-Healing] Unified permissions upserted successfully.");

        // 2. Fetch all current roles and permissions to map IDs
        const { data: dbRoles } = await supabase.from('roles').select('id, name');
        const { data: dbPerms } = await supabase.from('permissions').select('id, code');

        if (!dbRoles || !dbPerms) {
            console.error("[RBAC Self-Healing] Failed to fetch roles or permissions from database.");
            return;
        }

        const roleByName = new Map<string, string>();
        dbRoles.forEach(r => roleByName.set(r.name.toUpperCase(), r.id));

        const permByCode = new Map<string, string>();
        dbPerms.forEach(p => permByCode.set(p.code, p.id));

        // 3. Build role_permissions mappings list
        const mappings: { role_id: string; permission_id: string }[] = [];

        for (const [roleName, permCodes] of Object.entries(ROLE_PERMISSIONS_MAPPING)) {
            const roleId = roleByName.get(roleName.toUpperCase());
            if (!roleId) {
                console.log(`[RBAC Self-Healing] Role ${roleName} not found in database, skipping mappings.`);
                continue;
            }

            for (const code of permCodes) {
                const permId = permByCode.get(code);
                if (permId) {
                    mappings.push({ role_id: roleId, permission_id: permId });
                }
            }
        }

        // 4. Batch upsert mappings
        if (mappings.length > 0) {
            const { error: mappingError } = await supabase
                .from('role_permissions')
                .upsert(mappings, { onConflict: 'role_id,permission_id' });

            if (mappingError) {
                console.error("[RBAC Self-Healing] Error upserting role mappings:", mappingError.message);
            } else {
                console.log(`[RBAC Self-Healing] Successfully synchronized ${mappings.length} role-permission mappings.`);
            }
        }

    } catch (e: any) {
        console.error("[RBAC Self-Healing] Unexpected seeder error:", e.message);
    }
}
runRBACSelfHealing();

const PORT = env.PORT || 3000;

const server = app.listen(Number(PORT), () => {
    console.log(`Server running on port ${PORT} in ${env.NODE_ENV} mode`);

    // Run historical data cleanup once on boot
    const runDbCleanup = async () => {
        try {
            const { supabase } = await import('./config/supabase');
            const sqlQueries = [
                `UPDATE public.admission_leads 
                 SET counselor_id = (SELECT id FROM public.users WHERE email = 'counselor@edu.in' LIMIT 1), updated_at = NOW() 
                 WHERE counselor_id IS NULL AND (status = 'converted' OR id IN (SELECT lead_id FROM public.admission_applications))`,
                `INSERT INTO public.admission_leads (id, enquiry_id, counselor_id, status, created_at, updated_at)
                 SELECT 
                     uuid_generate_v4(), 
                     e.id, 
                     (SELECT id FROM public.users WHERE email = 'counselor@edu.in' LIMIT 1), 
                     'converted', 
                     NOW(), 
                     NOW()
                 FROM public.admission_enquiries e
                 LEFT JOIN public.admission_leads l ON l.enquiry_id = e.id
                 WHERE e.status = 'converted' AND l.id IS NULL`
            ];
            const { data, error } = await supabase.rpc('exec_transaction_queries', { sql_queries: sqlQueries });
            if (error) {
                console.error('[Startup] DB cleanup RPC error:', error.message);
            } else {
                console.log('[Startup] DB cleanup executed successfully:', data);
            }
        } catch (err: any) {
            console.error('[Startup] DB cleanup error:', err.message);
        }
    };
    runDbCleanup();

    // Diagnostic: Log active project configuration
    try {
        const urlMatch = env.SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase/);
        const projectRef = urlMatch ? urlMatch[1] : 'unknown';
        console.log(`[Startup] Active SUPABASE_URL: ${env.SUPABASE_URL}`);
        console.log(`[Startup] Active Project Reference: ${projectRef}`);
        console.log(`[Startup] Active Environment: ${env.NODE_ENV}`);
        console.log(`[Startup] Active Port: ${PORT}`);

        const keyParts = env.SUPABASE_KEY.split('.');
        if (keyParts.length === 3) {
            const payload = JSON.parse(Buffer.from(keyParts[1], 'base64').toString());
            console.log(`[Startup] SUPABASE_KEY Role: ${payload.role}`);
            console.log(`[Startup] SUPABASE_KEY Issuer Ref: ${payload.ref}`);
            if (payload.role !== 'service_role') {
                console.error('🚨 CRITICAL ERROR: You are using an ANON key. Please use the SERVICE_ROLE key in Render Environment Variables!');
            }
        }
    } catch (e) {
        console.error('[Startup] Could not parse SUPABASE_KEY. Is it a valid JWT?');
    }
});

// Graceful Shutdown
const shutdown = () => {
    console.log('Shutting down server...');
    server.close(() => {
        console.log('Server closed. Exit.');
        process.exit(0);
    });

    // Force shutdown if taking too long
    setTimeout(() => {
        console.error('Forced shutdown.');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);