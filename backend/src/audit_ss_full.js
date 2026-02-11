
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY);

async function checkSSFull() {
    const { data, error } = await supabase.from('student_sections').select('*').limit(1);
    if (!error && data.length > 0) {
        console.log("student_sections FULL:", JSON.stringify(Object.keys(data[0])));
    } else {
        console.log("student_sections failed/empty");
    }
}
checkSSFull();
