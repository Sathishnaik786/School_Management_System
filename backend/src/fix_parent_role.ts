
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_KEY!
);

async function fixParentRole(email: string) {
    console.log(`Fixing roles for ${email}...`);

    // 1. Get User
    const { data: { users }, error: uErr } = await supabase.auth.admin.listUsers();
    if (uErr) { console.error("Auth Error:", uErr); return; }

    const user = users.find(u => u.email === email);
    if (!user) {
        console.error("User not found in Auth!");
        return;
    }
    console.log(`Found User: ${user.id}`);

    // 2. Ensure user in public.users (sometimes sync fails?)
    const { data: publicUser } = await supabase.from('users').select('*').eq('id', user.id).single();
    if (!publicUser) {
        console.log("User missing in public.users, inserting...");
        // Insert basic user
        await supabase.from('users').insert({
            id: user.id,
            email: user.email,
            full_name: 'Sathish Parent',
            status: 'active',
            school_id: '98424e27-f734-41fd-991d-aca541ca0525d' // Default school ID from earlier log? Or query it.
        });
    }

    // 3. Get PARENT Role
    let { data: role } = await supabase.from('roles').select('id').eq('name', 'PARENT').single();

    if (!role) {
        console.log("PARENT Role not found, creating...");
        const { data: newRole } = await supabase.from('roles').insert({
            name: 'PARENT',
            description: 'Parent Role',
            school_id: '98424e27-f734-41fd-991d-aca541ca0525d'
        }).select().single();
        role = newRole;
    }

    if (!role) {
        console.error("Could not find or create PARENT role.");
        return;
    }
    console.log(`Role PARENT ID: ${role.id}`);

    // 4. Assign Role
    const { error: assignError } = await supabase.from('user_roles').insert({
        user_id: user.id,
        role_id: role.id
    });

    if (assignError) {
        if (assignError.code === '23505') {
            console.log("Role already assigned.");
        } else {
            console.error("Assign Error:", assignError);
        }
    } else {
        console.log("Role Assigned Successfully.");
    }

    // 5. Check Permission Mapping
    // Ensure PARENT role has DASHBOARD_VIEW_PARENT permission
    const { data: perm } = await supabase.from('permissions').select('id').eq('code', 'DASHBOARD_VIEW_PARENT').single();
    if (perm) {
        const { error: permMapError } = await supabase.from('role_permissions').insert({
            role_id: role.id,
            permission_id: perm.id
        });
        if (!permMapError) console.log("Mapped DASHBOARD_VIEW_PARENT to PARENT role.");
    } else {
        console.error("Permission DASHBOARD_VIEW_PARENT not found in DB.");
    }
}

fixParentRole('sathishnaikislavath@gmail.com');
