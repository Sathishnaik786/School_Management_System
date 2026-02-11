
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY);

async function inspectSchema() {
    console.log("--- SCHEMA INSPECTION V2 ---");
    const tables = [
        'students', 'student_sections', 'academic_years', 'exams', 'exam_schedules',
        'student_exam_eligibility', 'exam_seating', 'marks', 'student_result_summaries',
        'attendance', 'student_fees', 'fee_structures'
    ];

    for (const table of tables) {
        try {
            const { data, error } = await supabase.from(table).select('*').limit(1);
            if (error) {
                console.log(`\n### ${table} Error: ${error.message}`);
            } else if (data && data.length > 0) {
                console.log(`\n### ${table} Columns:\n- ${Object.keys(data[0]).join('\n- ')}`);
            } else {
                console.log(`\n### ${table} Empty/No Rows`);
            }
        } catch (e) {
            console.log(`\n### ${table} Exception: ${e.message}`);
        }
    }
}

inspectSchema();
