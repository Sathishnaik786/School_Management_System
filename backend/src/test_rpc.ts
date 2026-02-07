
import { supabase } from './config/supabase';

async function main() {
    console.log('Testing exec_sql RPC...');
    const { data, error } = await supabase.rpc('exec_sql', { sql: 'SELECT 1 as test' });
    if (error) {
        console.error('RPC exec_sql failed (likely not installed):', error.message);
    } else {
        console.log('RPC exec_sql success:', data);
    }
}

main();
