
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testRange() {
    console.log("Testing .range(NaN, NaN)...");
    const { data, count, error } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .range(NaN, NaN);

    if (error) {
        console.log("Error:", error.message);
    } else {
        console.log("Success! Count:", count);
    }
}

testRange();
