
import { supabase } from './config/supabase';

async function main() {
    const { data: fees } = await supabase.from('fee_structures').select('name, applicable_classes, academic_year_id, academic_year:academic_years(year_label)');

    console.log('All Fee Structures:');
    fees?.forEach(f => {
        // @ts-ignore
        console.log(`- Year: ${f.academic_year?.year_label}, Name: "${f.name}", Classes: "${f.applicable_classes}"`);
    });
}

main();
