
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY);

async function checkTable(name) {
    const { data, error } = await supabase.from(name).select('*').limit(1);
    if (!error && data.length > 0) {
        console.log(`--- ${name} ---`);
        Object.keys(data[0]).forEach(k => console.log(k));
    } else {
        console.log(`${name} failed or empty: ${error?.message}`);
    }
}

async function run() {
    await checkTable('students');
    await checkTable('admissions');
}
run();
