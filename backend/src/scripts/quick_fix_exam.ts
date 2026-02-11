
import { supabase } from '../config/supabase';

async function fix() {
    process.env.SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

    console.log('Fixing EXAM_CELL_ADMIN perms...');

    const roleName = 'EXAM_CELL_ADMIN';
    const role = await supabase.from('roles').select('id').eq('name', roleName).single();
    const perm = await supabase.from('permissions').select('id').eq('code', 'STUDENT_VIEW_SELF').single();

    if (role.data && perm.data) {
        const { error } = await supabase.from('role_permissions').insert({
            role_id: role.data.id,
            permission_id: perm.data.id
        });
        console.log('Insert result:', error ? error.message : 'Success');
    } else {
        console.log('Role or Perm not found');
    }
}
fix();
