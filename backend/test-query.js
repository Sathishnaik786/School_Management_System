
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testQuery() {
    console.log("Testing specific student query...");

    // 1. Find a student who IS in a section
    const { data: sectionAssignments } = await supabase.from('student_sections').select('student_id').limit(1);

    if (!sectionAssignments || sectionAssignments.length === 0) {
        console.log("No students assigned to sections");
        return;
    }

    const targetStudentId = sectionAssignments[0].student_id;
    console.log("Testing with Student ID:", targetStudentId);

    const { data, error } = await supabase
        .from('students')
        .select(`
            id,
            sections:student_sections(
                academic_year_id,
                section:section_id(
                    id,
                    name,
                    class_id,
                    class:class_id(id, name)
                )
            )
        `)
        .eq('id', targetStudentId)
        .single();

    if (error) {
        console.error("Query Failed:", JSON.stringify(error, null, 2));
    } else {
        console.log("Query Success!");
        console.log("Sample:", JSON.stringify(data, null, 2));
    }
}

testQuery();
