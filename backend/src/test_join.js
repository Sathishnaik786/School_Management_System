
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY);

async function testJoin() {
    const { data, error } = await supabase
        .from('students')
        .select('*, admission:admission_id(*)')
        .limit(1);

    if (error) {
        console.log("Error:", error.message);
    } else {
        console.log("Success:", JSON.stringify(data[0], null, 2));
    }
}
testJoin();
