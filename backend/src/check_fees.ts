
import { supabase } from './config/supabase';

async function main() {
    const { data: fees, error } = await supabase.from('fee_structures').select('*');
    if (error) {
        console.error(error);
        return;
    }
    console.log('Total Fee Structures:', fees.length);
    console.log(JSON.stringify(fees, null, 2));

    const { data: schools } = await supabase.from('schools').select('id, name');
    console.log('Schools:', schools);

    const { data: years } = await supabase.from('academic_years').select('*');
    console.log('Years:', years);
}

main();
