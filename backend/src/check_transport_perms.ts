import { supabase } from './config/supabase';

async function checkTransportAdminPermissions() {
    console.log('=== Checking Transport Admin Permissions ===\n');

    // Find transport admin user
    const { data: users } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', 'transport@school.com')
        .single();

    if (!users) {
        console.log('❌ Transport admin user not found');
        return;
    }

    console.log(`✅ Found user: ${users.email} (${users.id})\n`);

    // Get user roles
    const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role:role_id(name)')
        .eq('user_id', users.id);

    console.log('Roles:');
    userRoles?.forEach((ur: any) => {
        console.log(`  - ${ur.role.name}`);
    });

    // Get all permissions for TRANSPORT_ADMIN role
    const { data: rolePerms } = await supabase
        .from('role_permissions')
        .select('permission:permission_id(code, description), role:role_id(name)')
        .in('role_id', (await supabase.from('roles').select('id').eq('name', 'TRANSPORT_ADMIN')).data?.map((r: any) => r.id) || []);

    console.log('\nPermissions for TRANSPORT_ADMIN role:');
    rolePerms?.forEach((rp: any) => {
        console.log(`  - ${rp.permission.code}: ${rp.permission.description}`);
    });

    // Check specific permissions
    const requiredPerms = ['TRANSPORT_SETUP', 'TRANSPORT_ASSIGN', 'TRANSPORT_VIEW', 'TRIP_MONITOR', 'STUDENT_VIEW'];
    console.log('\nRequired permissions check:');

    const permCodes = rolePerms?.map((rp: any) => rp.permission.code) || [];
    requiredPerms.forEach(perm => {
        const has = permCodes.includes(perm);
        console.log(`  ${has ? '✅' : '❌'} ${perm}`);
    });

    process.exit(0);
}

checkTransportAdminPermissions().catch(console.error);
