import { supabase } from '../config/supabase';
import * as fs from 'fs';
import * as path from 'path';

async function fixMigrations() {
    console.log("Checking database state...");

    // 1. Check if exam_schedules exists (049)
    const { error: err49 } = await supabase.from('exam_schedules').select('id').limit(1);
    if (err49 && err49.message.includes('relation "exam_schedules" does not exist')) {
        console.log("Applying 049_create_exam_schedules.sql manually...");
        const sql = fs.readFileSync(path.join(__dirname, '../../database/migrations/049_create_exam_schedules.sql'), 'utf8');
        // Split by statement if needed, or run assuming logic support
        // Supabase-js doesn't support raw SQL easily unless rpc is set up, BUT
        // we can try valid SQL via a known workaround or just instruct user.
        // Actually, without a raw SQL RPC, we cannot execute DDL from the client.
        console.error("CRITICAL: Table exam_schedules missing. Please restart your backend migration runner.");
    } else {
        console.log("✅ 049 exam_schedules exists.");
    }

    // 2. Check if student_result_summaries exists (050)
    const { error: err50 } = await supabase.from('student_result_summaries').select('id').limit(1);
    if (err50 && err50.message.includes('relation "student_result_summaries" does not exist')) {
        console.error("CRITICAL: Table student_result_summaries missing (050).");
        console.log("The migration 050_grading_system.sql failed to apply.");
    } else {
        console.log("✅ 050 student_result_summaries exists.");
    }
}

fixMigrations();
