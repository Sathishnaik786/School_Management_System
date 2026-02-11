
// @ts-nocheck
import { createClient } from '@supabase/supabase-js';
import { env } from '../src/config/env';

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);

async function check() {
    const { data: qp } = await supabase.from('exam_question_papers').select('id').limit(1);
    console.log('Question Papers:', qp ? 'Exists' : 'Missing');
}

check();
