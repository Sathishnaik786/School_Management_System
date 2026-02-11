
// @ts-nocheck
import { createClient } from '@supabase/supabase-js';
import { env } from '../src/config/env';

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);

async function diag() {
    const { data: sch } = await supabase.from('exam_schedules').select('id').limit(1);
    console.log('Schedules:', sch ? 'Exists' : 'Missing');

    const { data: halls } = await supabase.from('exam_halls').select('id').limit(1);
    console.log('Halls:', halls ? 'Exists' : 'Missing');
}

diag();
