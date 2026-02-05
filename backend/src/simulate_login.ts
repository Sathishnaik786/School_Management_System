import { supabase } from './config/supabase';
import { SessionService } from './auth/session.service';

async function simulate() {
    console.log('Simulating Faculty Login...');
    const email = 'faculty1@school.com';

    // 1. Get User ID
    const { data: user } = await supabase.from('users').select('id').eq('email', email).single();
    if (!user) {
        console.error('User not found');
        return;
    }
    console.log('User ID:', user.id);

    // 2. Fetch Roles/Permissions exactly like SessionService
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

    if (rolesError) {
        console.error('Error fetching roles:', rolesError);
        return;
    }

    const roles: string[] = [];
    const permissions = new Set<string>();

    (rolesData as any)?.forEach((ur: any) => {
        const role = ur.roles;
        if (role) {
            roles.push(role.name);
            role.role_permissions?.forEach((rp: any) => {
                if (rp.permissions?.code) {
                    permissions.add(rp.permissions.code);
                }
            });
        }
    });

    console.log('Collected Roles:', roles);
    console.log('Collected Permissions:', Array.from(permissions));

    const required = 'DASHBOARD_VIEW_FACULTY';
    const hasPerm = permissions.has(required);
    console.log(`Has ${required} permission?`, hasPerm);

    if (!hasPerm) {
        console.log('Mismatch! The permission is missing from collected set.');
    }
}

simulate();
