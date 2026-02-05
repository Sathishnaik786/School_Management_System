import { supabase } from './config/supabase';

async function checkTables() {
    console.log("Checking tables...");

    // Check exams
    const { data: exams, error: examError } = await supabase.from('exams').select('*').limit(1);
    if (examError) console.error("Exams table error:", examError.message);
    else console.log("Exams table OK.");

    // Check section_faculty_assignments
    const { data: sfa, error: sfaError } = await supabase.from('section_faculty_assignments').select('*').limit(1);
    if (sfaError) {
        console.error("section_faculty_assignments table error:", sfaError.message);
        if (sfaError.message.includes('does not exist')) {
            console.log("CRITICAL: section_faculty_assignments table is missing!");
        }
    } else {
        console.log("section_faculty_assignments table OK.");
    }
}

checkTables();
