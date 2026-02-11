
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY);

async function inspectSchema() {
    const tables = [
        'students', 'student_sections', 'classes', 'sections', 'academic_years',
        'exams', 'exam_schedules', 'student_exam_eligibility', 'exam_seating',
        'marks', 'student_result_summaries', 'attendance', 'student_fees', 'fee_structures'
    ];

    console.log("--- SCHEMA INSPECTION ---");

    for (const table of tables) {
        try {
            // Get one row to see columns
            const { data, error } = await supabase.from(table).select('*').limit(1);
            if (error) {
                console.log(`\n[${table}] Error: ${error.message}`);
                continue;
            }
            if (data && data.length > 0) {
                console.log(`\n[${table}] Columns:`, Object.keys(data[0]).join(', '));
            } else {
                // If empty, try to get columns via a different trick or just note it's empty
                // For now, noting it's empty is fine, but I can't see foreign keys easily this way.
                console.log(`\n[${table}] Empty (Cannot list columns dynamically without rows)`);
            }
        } catch (e) {
            console.log(`\n[${table}] Exception: ${e.message}`);
        }
    }
}

inspectSchema();
