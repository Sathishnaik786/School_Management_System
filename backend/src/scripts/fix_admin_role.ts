import { supabase } from '../config/supabase';

async function fix() {
    const email = 'sathishnaikislavath@gmail.com';
    console.log(`Checking roles for ${email}...`);

    // 1. Get User
    const { data: user } = await supabase.from('users').select('id, user_roles(role:roles(name))').eq('email', email).single();

    if (!user) {
        console.error("User not found!");
        return;
    }

    const currentRoles = (user as any).user_roles.map((r: any) => r.role.name);
    console.log("Current Roles:", currentRoles);

    if (currentRoles.includes('ADMIN')) {
        console.log("User is already ADMIN.");
        return;
    }

    // 2. Get ADMIN Role ID
    const { data: role } = await supabase.from('roles').select('id').eq('name', 'ADMIN').single();
    if (!role) {
        console.error("ADMIN role not found in DB!");
        return;
    }

    // 3. Assign Role
    const { error } = await supabase.from('user_roles').insert({
        user_id: user.id,
        role_id: role.id
    });

    if (error) {
        console.error("Failed to assign role:", error.message);
    } else {
        console.log("SUCCESS: Assigned ADMIN role to user.");
    }
}

fix();
