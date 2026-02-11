
// @ts-nocheck
import { supabase } from '../src/config/supabase';

async function test() {
    const { data: user } = await supabase.auth.getUser();
    console.log('Current Auth User:', user);

    const { data: schools } = await supabase.from('schools').select('*');
    console.log('Schools count:', schools?.length || 0);
}

test();
