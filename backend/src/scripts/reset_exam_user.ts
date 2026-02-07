
import { supabase } from '../config/supabase';

const TARGET_EMAIL = 'examcell@gmail.com';
const PASSWORD = 'Welcome#321';
const ROLE_NAME = 'EXAM_CELL_ADMIN';

async function resetExamUser() {
    console.log(`Resetting user ${TARGET_EMAIL}...`);

    // 1. Check if user exists in Auth
    // The admin API listUsers is paginated, but we can search or list.
    // Sadly listUsers doesn't filter by email in all versions. 
    // We can try deleteUser directly if we have an ID, or just try to SignUp and see.
    // Better: use getUser functionality if possible, or just deleteUser logic via list.

    // Actually, createClient with service key grants access to `auth.admin` namespace.
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error("Failed to list users. Is SUPABASE_KEY a service role key?", listError);
        return;
    }

    const existingUser = users.find(u => u.email === TARGET_EMAIL);

    if (existingUser) {
        console.log(`Found existing auth user ${existingUser.id}. Deleting...`);
        const { error: delErr } = await supabase.auth.admin.deleteUser(existingUser.id);
        if (delErr) {
            console.error("Failed to delete user:", delErr);
            return;
        }
        console.log("Deleted.");

        // Also cleanup public.users to let trigger or manual insert work cleanly?
        // If we delete unique user in auth, cascade might handle public.users if configured.
        // If not, we should check.
        const { error: dbDelErr } = await supabase.from('users').delete().eq('id', existingUser.id);
        if (dbDelErr) console.log("DB delete note:", dbDelErr.message);
    }

    // 2. Create User via Admin (Auto Confirm)
    console.log("Creating user via Admin API...");
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: TARGET_EMAIL,
        password: PASSWORD,
        email_confirm: true, // IMPORTANT
        user_metadata: {
            full_name: 'Exam Cell Admin',
            role: ROLE_NAME
        }
    });

    if (createError) {
        console.error("Failed to create user:", createError);
        return;
    }

    if (!newUser.user) {
        console.error("Created but no user returned?");
        return;
    }

    console.log(`User created: ${newUser.user.id}`);

    // 3. Ensure public.users
    // Give trigger a moment (if exists)
    await new Promise(r => setTimeout(r, 1500));

    const { data: dbUser } = await supabase.from('users').select('id').eq('id', newUser.user.id).single();
    if (!dbUser) {
        console.log("User not in public.users. Inserting manually...");
        const { error: insertErr } = await supabase.from('users').insert({
            id: newUser.user.id,
            email: TARGET_EMAIL,
            full_name: 'Exam Cell Admin',
            role: ROLE_NAME
        });
        if (insertErr) {
            console.error("Failed to insert into public.users:", insertErr);
            return;
        }
    } else {
        console.log("User present in public.users.");
    }

    // 4. Assign Role
    // Get Role ID
    const { data: role } = await supabase.from('roles').select('id').eq('name', ROLE_NAME).single();
    if (!role) {
        console.error("Role EXAM_CELL_ADMIN not found! Run setup first.");
        return;
    }

    const { error: roleErr } = await supabase.from('user_roles').insert({
        user_id: newUser.user.id,
        role_id: role.id
    });

    if (roleErr && roleErr.code !== '23505') {
        console.error("Failed to assign role:", roleErr);
    } else {
        console.log("Role assigned.");
    }

    console.log("Reset Complete. Try login now.");
}

resetExamUser().catch(console.error);
