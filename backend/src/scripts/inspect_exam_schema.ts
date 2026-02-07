
import { supabase } from '../config/supabase';

async function logTableDetails(tableName: string) {
    console.log(`\n--- Structure for table: ${tableName} ---`);
    // Attempt to just select one row to infer structure since we can't query information_schema easily
    const { data, error } = await supabase.from(tableName).select('*').limit(1);

    if (error) {
        console.log(`[!] Error accessing table '${tableName}': ${error.message}`);
        return;
    }

    if (data && data.length > 0) {
        console.log('Columns found based on data:', Object.keys(data[0]).join(', '));
        console.log('Sample Row:', JSON.stringify(data[0], null, 2));
    } else {
        console.log('Table is accessible but empty. Cannot infer full columns without schema access.');
        // If empty, we might try to INSERT a dummy and see error, but that's risky.
    }
}

async function main() {
    console.log("Analyzing Exam Module Database Schema...");

    const tables = [
        'exams',
        'subjects',
        'marks',
        'exam_schedules',     // checking if exists
        'grading_scales',     // checking if exists
        'student_exam_registrations', // checking if exists
        'student_subjects',   // checking if exists
        'exam_halls',          // checking if exists
        'question_papers'      // checking if exists
    ];

    for (const t of tables) {
        await logTableDetails(t);
    }
}

main();
