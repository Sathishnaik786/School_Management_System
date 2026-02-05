
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_KEY!
);

async function checkUsers() {
    const { data, error } = await supabase.from('users').select('*');
    if (error) {
        console.error('Error fetching users:', error);
    } else {
        console.log('Users in public.users:', data);
    }

    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) {
        console.error('Error fetching auth users:', authError);
    } else {
        console.log('Users in auth.users:', authUsers.users.map(u => ({ id: u.id, email: u.email })));
    }
}

checkUsers();
