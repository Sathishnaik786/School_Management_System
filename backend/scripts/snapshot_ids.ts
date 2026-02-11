
// @ts-nocheck
import { createClient } from '@supabase/supabase-js';
import { env } from '../src/config/env';

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);

async function snapshot() {
    const { data: exam } = await supabase.from('exams').select('id, name').order('created_at', { ascending: false }).limit(1).single();
    const { data: students } = await supabase.from('students').select('id, full_name, student_code, admission_id').order('created_at', { ascending: false }).limit(2);

    console.log('Latest Exam:', exam);
    for (const s of students) {
        const { data: user } = await supabase.from('users').select('email').eq('id', s.admission_id).maybeSingle();
        console.log(`Student: ${s.full_name} | Code: ${s.student_code} | Email: ${user?.email}`);
    }
}

snapshot();
