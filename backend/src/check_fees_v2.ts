
import { supabase } from './config/supabase';

async function main() {
    // Get Active Year
    const { data: years } = await supabase.from('academic_years').select('*').eq('is_active', true);
    const activeYear = years?.[0];
    console.log('Active Year:', activeYear?.year_label, activeYear?.id);

    // Get Fees for this year
    const { data: fees, error } = await supabase
        .from('fee_structures')
        .select('name, applicable_classes, academic_year_id')
        .eq('academic_year_id', activeYear?.id || '');

    if (error) {
        console.error(error);
        return;
    }

    console.log('Fees for Active Year:');
    fees?.forEach(f => {
        console.log(`- Name: "${f.name}", Applicable: "${f.applicable_classes}"`);
    });
}

main();
