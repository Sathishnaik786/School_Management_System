
// @ts-nocheck
import { createClient } from '@supabase/supabase-js';
import { env } from '../src/config/env';

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);

async function run() {
    const { data: enrolls } = await supabase.from('student_sections').select('*').limit(1);
    if (enrolls && enrolls.length > 0) {
        console.log('Columns:', Object.keys(enrolls[0]));
    } else {
        console.log('No data');
        // Try to find if the table exists but is empty
        const { error } = await supabase.from('student_sections').select('count', { count: 'exact', head: true });
        console.log('Table exists:', !error);
    }
}

run();
