
import { supabase } from './config/supabase';

async function listPerms() {
    process.env.SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

    // Explicitly query filtering by role name using join
    const { data, error } = await supabase
        .from('role_permissions')
        .select(`
            role:roles!inner(name),
            permission:permissions!inner(code)
        `)
        .eq('role.name', 'EXAM_CELL_ADMIN');

    if (error) {
        console.error(error);
        return;
    }

    console.log("EXAM_CELL_ADMIN Permissions:");
    data.forEach((p: any) => {
        console.log(`- ${p.permission.code}`);
    });
}
listPerms();
