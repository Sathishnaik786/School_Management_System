
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
    const { data: rolesData } = await supabase
        .from('user_roles')
        .select(`
        user_id,
        roles (name)
    `);

    const studentUserIds = rolesData
        ?.filter((r: any) => r.roles?.name === 'STUDENT')
        .map((r: any) => r.user_id) || [];

    if (studentUserIds.length === 0) {
        console.log("No users with STUDENT role found.");
    } else {
        const { data: students } = await supabase
            .from('users')
            .select('email, full_name, id')
            .in('id', studentUserIds)
            .limit(5);

        console.log("\nPossible Student Logins:");
        students?.forEach(s => {
            console.log(`- Email: ${s.email} | Name: ${s.full_name}`);
        });
    }

    // Check specifically for raju
    const { data: raju } = await supabase
        .from('users')
        .select('email, id')
        .ilike('email', '%raju%')
        .single();

    if (raju) {
        const { data: rajuRoles } = await supabase
            .from('user_roles')
            .select('roles(name)')
            .eq('user_id', raju.id);

        const rRoles = rajuRoles?.map((r: any) => r.roles?.name).join(', ');
        console.log(`\nUser 'raju' roles: ${rRoles}`);
    }
}

main().catch(console.error);
