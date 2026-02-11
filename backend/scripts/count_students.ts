
// @ts-nocheck
import { createClient } from '@supabase/supabase-js';
import { env } from '../src/config/env';

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);

async function run() {
    const { data: sections } = await supabase.from('sections').select('id, name');
    for (const sec of sections) {
        const { count } = await supabase.from('student_sections').select('*', { count: 'exact', head: true }).eq('section_id', sec.id);
        console.log(`Section ${sec.name} (${sec.id}) has ${count} students`);
    }
}

run();
