
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY);

async function testSeatingQuery() {
    console.log("Testing Exam Seating Query...");
    try {
        // Trying to replicate: .select('id, full_name, student_code, section:section_id!inner(class_id)')
        // But 'section_id' is not on students.
        // If it's a relationship, let's see.

        const { data, error } = await supabase
            .from('students')
            .select('id, full_name, student_code, section:section_id!inner(class_id)')
            .limit(1);

        if (error) {
            console.log("Query FAILED:", error.message);
        } else {
            console.log("Query SUCCESS:", JSON.stringify(data, null, 2));
        }

        // Try the correct one from student.routes.ts for comparison
        const { data: data2, error: error2 } = await supabase
            .from('students')
            .select('id, full_name, student_code, sections:student_sections(section:section_id(class_id))')
            .limit(1);

        if (error2) console.log("Alt Query FAILED:", error2.message);
        else console.log("Alt Query SUCCESS");

    } catch (e) {
        console.log("Exception:", e.message);
    }
}

testSeatingQuery();
