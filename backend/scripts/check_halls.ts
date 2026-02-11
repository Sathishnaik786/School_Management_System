
// @ts-nocheck
import { createClient } from '@supabase/supabase-js';
import { env } from '../src/config/env';

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);

async function diag() {
    const { data: tables } = await supabase.rpc('get_tables'); // If RPC exists? No.
    // Try joining information_schema via RPC or just common tables
    const { data: halls, error } = await supabase.from('exam_halls').select('*');
    if (error) {
        console.error('Halls Error:', error.message);
    } else {
        console.log('Halls Count:', halls.length);
    }
}

diag();
