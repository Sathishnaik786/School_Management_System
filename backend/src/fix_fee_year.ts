
import { supabase } from './config/supabase';

async function main() {
    // 1. Get Active Year
    const { data: years } = await supabase.from('academic_years').select('*').eq('is_active', true);
    const activeYear = years?.[0];
    if (!activeYear) {
        console.error('No active year found');
        return;
    }
    console.log(`Active Year: ${activeYear.year_label} (${activeYear.id})`);

    // 2. Get the other year (assuming only one other for now, or just get the one with fees)
    const { data: fees } = await supabase.from('fee_structures').select('*');
    if (!fees || fees.length === 0) {
        console.log('No fees to migrate');
        return;
    }

    // Check which year they belong to
    const wrongYearId = fees[0].academic_year_id;
    if (wrongYearId === activeYear.id) {
        console.log('Fees are already linked to the active year!');
        return;
    }

    console.log(`Migrating ${fees.length} fees from ${wrongYearId} to ${activeYear.id}...`);

    // 3. Update
    const { error } = await supabase
        .from('fee_structures')
        .update({ academic_year_id: activeYear.id })
        .eq('academic_year_id', wrongYearId);

    if (error) {
        console.error('Migration failed:', error);
    } else {
        console.log('Migration successful!');
    }
}

main();
