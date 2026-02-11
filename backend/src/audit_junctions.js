
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY);

async function checkJunctions() {
    const list = ['student_sections', 'student_exam_eligibility', 'exam_seating'];
    for (const t of list) {
        const { data, error } = await supabase.from(t).select('*').limit(1);
        if (!error && data.length > 0) {
            console.log(`${t}:`, Object.keys(data[0]));
        } else {
            console.log(`${t} failed/empty: ${error?.message}`);
        }
    }
}
checkJunctions();
