import { supabase } from '../config/supabase';

async function debugPermissions() {
    const email = 'sathishnaikislavath@gmail.com';
    console.log(`Checking permissions for: ${email}`);

    // 1. Get User ID
    const { data: user } = await supabase.from('users').select('id').eq('email', email).single();
    if (!user) { console.error("User not found"); return; }

    // 2. Get Roles
    const { data: rolesData } = await supabase
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

    console.log("ROLES ASSIGNED:");
    const finalPermissions = new Set<string>();

    rolesData?.forEach((r: any) => {
        const roleName = r.roles.name;
        console.log(`- ${roleName}`);

        r.roles.role_permissions.forEach((rp: any) => {
            const code = rp.permissions.code;
            finalPermissions.add(code);
        });
    });

    console.log("\nTOTAL PERMISSIONS:", finalPermissions.size);
    if (finalPermissions.has('FACULTY_PROFILE_MANAGE')) {
        console.log("✅ FACULTY_PROFILE_MANAGE: PRESENT");
    } else {
        console.log("❌ FACULTY_PROFILE_MANAGE: MISSING");
    }
}

debugPermissions();
