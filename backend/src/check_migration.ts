import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yqjufizhoqertztzjffa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxanVmaXpob3FlcnR6dHpqZmZhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTQzMDg3NCwiZXhwIjoyMDg1MDA2ODc0fQ.kSZpopVVL1hkhTN1xOxTDFdYZZRi2psBtEJLN5jbG3s';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log('Running RPC exec_sql...');
    // Trying to run SQL using a custom function if user has created one (common pattern).
    // If not, we cannot modify schema from here.
    // However, we can inspect if the column exists.

    // Check if created_by column exists
    // We can't query information_schema easily via postgrest unless we have a view.
    // But we can try to select 'created_by' from exams.
    const { data, error } = await supabase.from('exams').select('created_by').limit(1);

    if (error) {
        console.log("Column likely missing:", error.message);
        console.log("CRITICAL: You must manually run the SQL migration `023_exam_ownership.sql` in your Supabase Dashboard SQL Editor.");
        console.log("For now, we will revert the backend route change to avoid 500 errors.");
    } else {
        console.log("Column exists!");
    }
}

run();
