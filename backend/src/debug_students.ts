
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_KEY!
);

async function listStudents() {
    console.log("Fetching students...");
    const { data, error } = await supabase
        .from('students')
        .select('id, full_name, student_code, status')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error('Error:', error);
    } else {
        console.log("Recent Students:");
        console.log(JSON.stringify(data, null, 2));
    }
}

listStudents();
