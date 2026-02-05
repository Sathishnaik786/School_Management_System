import { supabase } from './config/supabase';

async function checkData() {
    console.log('Checking Academic Years...');
    const { data: years, error } = await supabase.from('academic_years').select('*');
    if (error) console.error(error);
    console.log(years);

    console.log('Checking Admin Permissions...');
    const { data: adminRole } = await supabase.from('roles').select('id').eq('name', 'ADMIN').single();
    if (adminRole) {
        const { data: perms } = await supabase.from('role_permissions')
            .select('permissions(code)')
            .eq('role_id', adminRole.id);

        const codes = perms?.map((p: any) => p.permissions.code);
        console.log('Has EXAM_CREATE?', codes?.includes('EXAM_CREATE'));
    }
}

checkData();
