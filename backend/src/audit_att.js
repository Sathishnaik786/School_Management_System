
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY);

async function checkAtt() {
    const { data, error } = await supabase.from('attendance_records').select('*').limit(1);
    if (!error && data.length > 0) {
        console.log("attendance_records:", Object.keys(data[0]));
    } else {
        console.log("attendance_records failed/empty:", error?.message);
    }
}
checkAtt();
