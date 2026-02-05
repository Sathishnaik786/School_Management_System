
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
    console.log('--- Listing Users and Roles ---');

    // Fetch users from auth.users (requires service role)
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
        console.error('Error fetching auth users:', authError);
        return;
    }

    // Fetch roles from public schema if they are stored there (e.g., in a profiles table or user_roles)
    // Based on "EnrichedUser" type, roles are likely in a separate query or enriched in the backend.
    // We'll check the 'users' table in public schema or 'user_roles'. 
    // Let's assume there is a 'users' table in public that maps to auth.users.

    const { data: publicUsers, error: dbError } = await supabase
        .from('users')
        .select('id, email, role, roles'); // Trying varying column names

    if (dbError) {
        // If error, maybe table is different. Let's list tables? No, let's try just 'users' first.
        console.log('Could not fetch generic users table details (might use different schema):', dbError.message);
    }

    console.log(`Found ${users.length} auth users.`);

    for (const u of users) {
        // Find matching public user profile if exists
        const profile = publicUsers?.find((p: any) => p.email === u.email || p.id === u.id);

        // Determine roles - often stored in app_metadata or user_metadata in Supabase Auth
        const metaRoles = u.app_metadata?.roles || u.user_metadata?.roles || [];
        const dbRoles = profile?.roles || (profile?.role ? [profile.role] : []);

        const distinctRoles = Array.from(new Set([...metaRoles, ...dbRoles]));

        console.log(`User: ${u.email}`);
        console.log(`  ID: ${u.id}`);
        console.log(`  Auth Roles (Metadata): ${JSON.stringify(metaRoles)}`);
        console.log(`  DB Roles: ${JSON.stringify(dbRoles)}`);
        console.log(`  EFFECTIVE ROLES: ${distinctRoles.join(', ')}`);
        console.log('-----------------------------------');
    }
}

main().catch(console.error);
