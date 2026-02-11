
// @ts-nocheck
import { createClient } from '@supabase/supabase-js';
import { env } from '../src/config/env';

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);

async function diag() {
    const { data: enrolls } = await supabase.from('student_sections').select('*');
    if (enrolls) {
        enrolls.forEach(e => {
            console.log(`Enrollment: Student=${e.student_id}, Section=${e.section_id}, Year=${e.academic_year_id}`);
        });
    }
}

diag();
