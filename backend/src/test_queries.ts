import { supabase } from './config/supabase';

async function testQueries() {
    const userId = '76a002ce-8ce4-49c5-aed1-349e46803634'; // ID from diagnose_user.ts
    const schoolId = 'daaddbd6-9764-44d7-8e6d-62d4e845f35b'; // Guessing or need to fetch.
    // Fetch school_id from user
    const { data: user } = await supabase.from('users').select('school_id').eq('id', userId).single();
    const realSchoolId = user?.school_id;

    console.log("Testing Exams Query...");
    const { data: exams, error: examError } = await supabase
        .from('exams')
        .select('*, academic_year:academic_year_id(year_label)')
        .eq('school_id', realSchoolId)
        .order('start_date', { ascending: false });

    if (examError) console.error("Exams Query Failed:", examError);
    else console.log(`Exams Query Success. Found ${exams.length} exams.`);

    console.log("Testing Sections Query...");
    const { data: sections, error: secError } = await supabase
        .from('section_faculty_assignments')
        .select(`
                status,
                section:section_id (
                    id, name,
                    class:class_id (name, academic_year:academic_year_id(year_label))
                )
            `)
        .eq('faculty_id', userId)
        .eq('status', 'ACTIVE');

    if (secError) console.error("Sections Query Failed:", secError);
    else console.log(`Sections Query Success. Found ${sections.length} sections.`);
}

testQueries();
