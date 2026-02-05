import { supabase } from './config/supabase';

async function check() {
    console.log("Checking permissions for FACULTY role...");

    const { data: role } = await supabase.from('roles').select('id').eq('name', 'FACULTY').single();
    if (!role) {
        console.error("FACULTY role not found!");
        return;
    }

    const { data: perms } = await supabase
        .from('role_permissions')
        .select('permission:permission_id(code)')
        .eq('role_id', role.id);

    const codes = perms?.map((p: any) => p.permission.code);
    console.log("FACULTY Permissions:", codes);

    if (codes?.includes('EXAM_VIEW')) {
        console.log("SUCCESS: EXAM_VIEW is present.");
    } else {
        console.error("FAILURE: EXAM_VIEW is MISSING.");
    }
}

check();
