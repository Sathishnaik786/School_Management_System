
import { supabase } from './config/supabase';

async function main() {
    const { data: years } = await supabase.from('academic_years').select('id, year_label');
    const { data: fees } = await supabase.from('fee_structures').select('id, academic_year_id');

    console.log('Years:', years);

    // Count fees per year
    const counts: Record<string, number> = {};
    fees?.forEach(f => {
        counts[f.academic_year_id] = (counts[f.academic_year_id] || 0) + 1;
    });

    console.log('Fees Distribution:', counts);
}

main();
