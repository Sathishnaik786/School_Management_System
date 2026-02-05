
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
    console.log('--- Checking User Roles (Corrected Schema) ---');

    // 1. List users from public.users
    const { data: users, error: userError } = await supabase
        .from('users')
        .select('id, email, full_name, status');

    if (userError) {
        console.error('Error fetching users:', userError);
        return;
    }

    console.log(`Found ${users.length} users in public.users.`);

    for (const user of users) {
        // 2. Fetch Roles via user_roles -> roles
        const { data: rolesData, error: rolesError } = await supabase
            .from('user_roles')
            .select(`
            roles (
                name
            )
        `)
            .eq('user_id', user.id);

        if (rolesError) {
            console.error(`Error fetching roles for ${user.email}:`, rolesError.message);
            continue;
        }

        const roles = rolesData?.map((r: any) => r.roles?.name).filter(Boolean) || [];

        console.log(`User: ${user.email} (${user.full_name})`);
        console.log(`  ID: ${user.id}`);
        console.log(`  Roles: ${roles.join(', ')}`);

        if (roles.includes('STUDENT')) {
            console.log(`  >>> THIS IS A STUDENT ACCOUNT <<<`);
        }
        if (roles.includes('PARENT')) {
            console.log(`  >>> THIS IS A PARENT ACCOUNT <<<`);
        }

        console.log('-----------------------------------');
    }
}

main().catch(console.error);
