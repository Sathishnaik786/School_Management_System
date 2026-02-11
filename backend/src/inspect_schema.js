
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY);

async function checkSchema() {
    try {
        const tables = ['users', 'students', 'student_parents', 'admissions'];
        for (const table of tables) {
            const { data, error } = await supabase.from(table).select('*').limit(1);
            if (error) {
                console.log(`Error ${table}:`, error.message);
            } else if (data && data.length > 0) {
                console.log(`${table} columns:`, Object.keys(data[0]));
            } else {
                console.log(`${table}: No records found to inspect columns.`);
            }
        }
    } catch (err) {
        console.error("Error:", err);
    }
}
checkSchema();
