
import { supabase } from './config/supabase';

async function fixExamCellAdminPermissions() {
    console.log("Adding missing permissions to EXAM_CELL_ADMIN role...");

    const roleName = 'EXAM_CELL_ADMIN';
    const permissionsToAdd = [
        'STUDENT_VIEW',
        'STUDENT_VIEW_SELF', // Often needed for shared components
        'CLASS_VIEW',
        'SECTION_VIEW'
    ];

    // 1. Get Role ID
    const { data: role, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', roleName)
        .single();

    if (roleError || !role) {
        console.error("Role not found:", roleError);
        return;
    }

    console.log(`Role ID for ${roleName}: ${role.id}`);

    // 2. Add Permissions
    for (const code of permissionsToAdd) {
        // Get Permission ID
        const { data: perm, error: permError } = await supabase
            .from('permissions')
            .select('id')
            .eq('code', code)
            .single();

        if (permError || !perm) {
            console.error(`Permission code ${code} not found.`);
            continue;
        }

        // Insert Link
        const { error: linkError } = await supabase
            .from('role_permissions')
            .upsert({ role_id: role.id, permission_id: perm.id }, { onConflict: 'role_id, permission_id' });

        if (linkError) {
            console.error(`Failed to add ${code}:`, linkError.message);
        } else {
            console.log(`Added ${code} to ${roleName}`);
        }
    }
}

fixExamCellAdminPermissions();
