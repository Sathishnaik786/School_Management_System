
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function inspectSchema() {
    console.log("Inspecting student_sections columns...");
    // Use rpc or information_schema if possible, but simplest is to select * limit 1 and see keys
    const { data, error } = await supabase.from('student_sections').select('*').limit(1);

    if (error) {
        console.error("Error:", error);
    } else {
        if (data.length > 0) {
            console.log("Columns:", Object.keys(data[0]));
        } else {
            console.log("Table is empty, cannot infer columns from data.");
            // Try to insert invalid column to get error message with hints? No.
        }
    }
}

inspectSchema();
