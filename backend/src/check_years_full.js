
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY);

async function checkYearsFull() {
    const { data: years } = await supabase.from('academic_years').select('*').limit(1);
    if (years && years.length > 0) {
        console.log("Full columns:", JSON.stringify(Object.keys(years[0]), null, 2));
    }
}
checkYearsFull();
