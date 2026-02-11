
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY);

async function checkSections() {
    const { data, error } = await supabase.from('sections').select('*').limit(1);
    if (!error && data.length > 0) {
        console.log("sections:", Object.keys(data[0]));
    } else {
        console.log("sections failed/empty:", error?.message);
    }
}
checkSections();
