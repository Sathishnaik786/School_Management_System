
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env from backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_KEY!
);

const PERMISSIONS_TO_FIX = [
    // Exams
    { code: 'MARKS_VIEW', description: 'View Exam Marks and Report Cards' },

    // Academics
    { code: 'STUDENT_VIEW_SELF', description: 'View own student data (or children)' },
    { code: 'TIMETABLE_VIEW_SELF', description: 'View own timetable' },
    { code: 'ATTENDANCE_VIEW_SELF', description: 'View own attendance' },

    // Fees
    { code: 'PAYMENT_VIEW_SELF', description: 'View own fee status and payments' },

    // Transport
    { code: 'TRANSPORT_VIEW_SELF', description: 'View own transport details' },

    // Core
    { code: 'DASHBOARD_VIEW_PARENT', description: 'View Parent Dashboard' },
    // { code: 'DASHBOARD_VIEW_STUDENT', description: 'View Student Dashboard' } // DashboardLayout doesn't check perm for student dashboard, but good to have
];

async function fixAccess() {
    console.log("Starting Student/Parent Permission Fix...");

    // 1. Upsert Permissions
    console.log("1. Ensuring Permissions exist...");
    for (const p of PERMISSIONS_TO_FIX) {
        const { error } = await supabase
            .from('permissions')
            .upsert({
                code: p.code,
                description: p.description,
                module: 'CORE', // Assuming CORE or similar
                updated_at: new Date().toISOString()
            }, { onConflict: 'code' });

        if (error) console.error(`Error upserting permission ${p.code}:`, error.message);
    }

    // 2. Fetch Role IDs
    console.log("2. Fetching Roles...");
    const { data: roles } = await supabase
        .from('roles')
        .select('id, name')
        .in('name', ['STUDENT', 'PARENT']);

    const studentRole = roles?.find(r => r.name === 'STUDENT');
    const parentRole = roles?.find(r => r.name === 'PARENT');

    if (!studentRole) console.warn("STUDENT role not found!");
    if (!parentRole) console.warn("PARENT role not found!");

    // 3. Map Permissions
    const mapPermissionToRole = async (roleId: string, roleName: string, perms: string[]) => {
        console.log(`Mapping permissions for ${roleName}...`);

        // Get permission IDs
        const { data: dbPerms } = await supabase
            .from('permissions')
            .select('id, code')
            .in('code', perms);

        if (!dbPerms) return;

        for (const perm of dbPerms) {
            const { error } = await supabase
                .from('role_permissions')
                .upsert({
                    role_id: roleId,
                    permission_id: perm.id
                }, { onConflict: 'role_id, permission_id' });

            if (error) console.error(`Failed to map ${perm.code} to ${roleName}:`, error.message);
            else console.log(`Mapped ${perm.code} to ${roleName}`);
        }
    };

    // STUDENT Permissions
    if (studentRole) {
        await mapPermissionToRole(studentRole.id, 'STUDENT', [
            'MARKS_VIEW',
            'STUDENT_VIEW_SELF',
            'TIMETABLE_VIEW_SELF',
            'ATTENDANCE_VIEW_SELF',
            'PAYMENT_VIEW_SELF',
            'TRANSPORT_VIEW_SELF'
        ]);
    }

    // PARENT Permissions
    if (parentRole) {
        await mapPermissionToRole(parentRole.id, 'PARENT', [
            'MARKS_VIEW',
            'STUDENT_VIEW_SELF',     // Layout uses this for 'My Children'
            'ATTENDANCE_VIEW_SELF',  // Layout uses this for attendance
            'PAYMENT_VIEW_SELF',     // Fees
            'TRANSPORT_VIEW_SELF',   // Transport
            'DASHBOARD_VIEW_PARENT'
        ]);
    }

    console.log("Fix Complete!");
}

fixAccess();
