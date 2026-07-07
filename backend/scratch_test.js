const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY);

async function test() {
    const { data: demands, error: dErr } = await supabase.from('fee_demands').select('*').limit(1);
    console.log('fee_demands:', { length: demands?.length, error: dErr });

    const { data: receipts, error: rErr } = await supabase.from('fee_receipts').select('*').limit(1);
    console.log('fee_receipts:', { length: receipts?.length, error: rErr });

    const { data: ledger, error: lErr } = await supabase.from('student_fee_ledger').select('*').limit(1);
    console.log('student_fee_ledger:', { length: ledger?.length, error: lErr });
}
test();
