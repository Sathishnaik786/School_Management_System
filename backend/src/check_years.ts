
import { supabase } from './config/supabase';

async function main() {
    const { data: years } = await supabase.from('academic_years').select('*');
    console.log(JSON.stringify(years, null, 2));
}

main();
