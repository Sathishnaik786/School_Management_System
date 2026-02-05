import { supabase } from './config/supabase';

async function debugSession() {
    const email = 'faculty1@school.com';
    console.log(`Debugging session for ${email}...`);

    const { data: user } = await supabase.from('users').select('id').eq('email', email).single();
    if (!user) return;

    const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select(`
            roles (
                name,
                role_permissions (
                    permissions (
                        code
                    )
                )
            )
        `)
        .eq('user_id', user.id);

    console.log('Roles Data Structure:');
    console.log(JSON.stringify(rolesData, null, 2));

    const roles: string[] = [];
    const permissions = new Set<string>();

    rolesData?.forEach((ur: any) => {
        const role = ur.roles;
        if (role) {
            roles.push(role.name);
            role.role_permissions?.forEach((rp: any) => {
                // Check multiple possible structures
                const code = rp.permissions?.code;
                if (code) {
                    permissions.add(code);
                }
            });
        }
    });

    console.log('Final Roles:', roles);
    console.log('Final Permissions:', Array.from(permissions));
}

debugSession();
