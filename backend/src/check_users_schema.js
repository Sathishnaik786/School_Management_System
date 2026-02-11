
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY);

async function checkSchema() {
    try {
        // Users
        const { data: u } = await supabase.from('users').select('*').limit(1);
        console.log("Users:", u?.length ? Object.keys(u[0]) : "No data");

        // Students
        const { data: s } = await supabase.from('students').select('*').limit(1);
        console.log("Students:", s?.length ? Object.keys(s[0]) : "No data");

        // Student Parents
        const { data: sp } = await supabase.from('student_parents').select('*').limit(1);
        console.log("Student Parents:", sp?.length ? Object.keys(sp[0]) : "No data");

        // Admissions (often has address)
        const { data: a } = await supabase.from('admissions').select('*').limit(1);
        console.log("Admissions:", a?.length ? Object.keys(a[0]) : "No data");

    } catch (err) {
        console.error("Error:", err);
    }
}
checkSchema();
