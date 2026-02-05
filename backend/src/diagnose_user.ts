import { supabase } from './config/supabase';
import { sessionService } from './auth/session.service';

async function diagnose() {
    console.log("Diagnosing Faculty Users...");

    // 1. Find a faculty user
    const { data: roles } = await supabase.from('roles').select('id, name').eq('name', 'FACULTY');
    if (!roles || roles.length === 0) { console.error("No FACULTY role found"); return; }
    const facultyRoleId = roles[0].id;

    const { data: userRoles } = await supabase.from('user_roles').select('user_id').eq('role_id', facultyRoleId);

    if (!userRoles || userRoles.length === 0) {
        console.log("No users have FACULTY role assigned in user_roles table.");
        return;
    }

    console.log(`Found ${userRoles.length} faculty users.`);
    const sampleUserId = userRoles[0].user_id;
    console.log("Testing with User ID:", sampleUserId);

    // 2. Fetch User Profile to get email
    const { data: user } = await supabase.from('users').select('email').eq('id', sampleUserId).single();
    console.log("User Email:", user?.email);

    // 3. Simulate Session Validation Logic
    const { data: rolesData, error } = await supabase
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
        .eq('user_id', sampleUserId);

    if (error) console.error("Error fetching roles:", error);

    const permissions = new Set<string>();
    rolesData?.forEach((ur: any) => {
        ur.roles.role_permissions?.forEach((rp: any) => {
            if (rp.permissions?.code) permissions.add(rp.permissions.code);
        });
    });

    console.log("Permissions Count:", permissions.size);
    console.log("Has EXAM_VIEW?", permissions.has('EXAM_VIEW'));
    console.log("Has SECTION_VIEW?", permissions.has('SECTION_VIEW'));
    console.log("Has MARKS_ENTER?", permissions.has('MARKS_ENTER'));
}

diagnose();
