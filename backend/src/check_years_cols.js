
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY);

async function checkYears() {
    const { data, error } = await supabase.from('academic_years').select('*');
    if (error) console.log(error);
    else if (data && data.length > 0) {
        console.log("Academic Years Columns:", Object.keys(data[0]));
    } else {
        console.log("No Academic Years found.");
    }
}
checkYears();
