import { supabase } from '../config/supabase';

async function fixPermissions() {
    const PERM_CODE = 'FACULTY_PROFILE_MANAGE';
    const ROLE_NAME = 'ADMIN';

    console.log(`Fixing permission ${PERM_CODE} for role ${ROLE_NAME}...`);

    let permId = '';

    // 1. Get/Create Permission
    const { data: perm } = await supabase.from('permissions').select('id').eq('code', PERM_CODE).single();

    if (perm) {
        console.log("Permission exists.");
        permId = perm.id;
    } else {
        console.log("Permission not found. Creating...");
        // Try minimal insert first
        const { data: newPerm, error } = await supabase.from('permissions').insert({
            code: PERM_CODE,
            description: 'Manage Faculty Profiles'
            // module field removed to be safe
        }).select('id').single();

        if (error || !newPerm) {
            console.error("Create Perm Error:", error?.message);
            return;
        }
        permId = newPerm.id;
    }
    console.log("Permission ID:", permId);

    // 2. Get Role ID
    const { data: role } = await supabase.from('roles').select('id').eq('name', ROLE_NAME).single();
    if (!role) { console.error("Role not found"); return; }
    console.log("Role ID:", role.id);

    // 3. Link
    const { error: linkError } = await supabase.from('role_permissions').insert({
        role_id: role.id,
        permission_id: permId
    });

    if (linkError) {
        if (linkError.code === '23505') {
            console.log("Permission already linked (Success/Duplicate).");
        } else {
            console.error("Link Error:", linkError.message);
        }
    } else {
        console.log("SUCCESS: Linked permission");
    }
}

fixPermissions().catch(err => console.error(err));
