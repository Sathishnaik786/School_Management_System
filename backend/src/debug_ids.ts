
import { supabase } from './config/supabase';

async function main() {
    const { data: years } = await supabase.from('academic_years').select('id, year_label, is_active');
    console.log('--- Academic Years ---');
    years?.forEach(y => console.log(`${y.id} | "${y.year_label}" | Active: ${y.is_active}`));

    const { data: fees } = await supabase.from('fee_structures').select('id, name, academic_year_id');
    console.log('\n--- Fee Structures ---');
    fees?.forEach(f => console.log(`${f.id} | "${f.name}" | YearID: ${f.academic_year_id}`));
}

main();
