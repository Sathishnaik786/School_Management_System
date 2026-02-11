
// @ts-nocheck
import { createClient } from '@supabase/supabase-js';
import { env } from '../src/config/env';

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);

async function setup() {
    const email = 'uat.admin.fixed@test.com';
    const pass = 'password123';

    // 1. Get School
    const { data: school } = await supabase.from('schools').select('id').limit(1).single();

    // 2. Create User
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email, password: pass, email_confirm: true
    });

    if (authError && authError.message !== 'User already exists') {
        console.error(authError);
    }

    const userId = authError?.message === 'User already exists' ?
        (await supabase.from('users').select('id').eq('email', email).single()).data.id :
        authUser.user.id;

    // 3. Ensure Profile & Role
    await supabase.from('users').upsert({ id: userId, email, school_id: school.id, full_name: 'UAT Admin Fixed', status: 'active', login_status: 'APPROVED' });
    const { data: role } = await supabase.from('roles').select('id').eq('name', 'ADMIN').single();
    await supabase.from('user_roles').upsert({ user_id: userId, role_id: role.id });

    console.log(`Setup complete. Admin: ${email} / ${pass}`);
}

setup();
