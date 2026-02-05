import { supabase } from '../config/supabase';

async function checkSubjectSchema() {
    console.log("Checking subjects table schema...");

    // Attempt to insert a dummy record with all columns to see what is accepted
    // and what errors we get, OR try to fetch one if exists.
    // Better yet, just try to select * and see headers.

    const { data, error } = await supabase.from('subjects').select('*').limit(1);

    if (error) {
        console.error("Schema check failed:", error.message);
    } else {
        console.log("Sample Data / Columns:", data && data.length > 0 ? Object.keys(data[0]) : "No rows yet (checking with RPC or just assume default)");
    }

    // Try to get info about columns from information_schema via RPC or raw query if allowed
    // But typically we don't have permission for info_schema from Anon/Service key via PostgREST.

    // Let's try a dry-run insert to see if it fails on missing columns
    const { error: insertError } = await supabase.from('subjects').insert({
        school_id: '00000000-0000-0000-0000-000000000000',
        class_id: '00000000-0000-0000-0000-000000000000',
        name: 'SCHEMACHECK',
        code: 'CHECK',
        type: 'theory',
        credits: 0
    });

    if (insertError) {
        console.log("Insert Test Result (EXPECTED FAILURE IF MISSING):", insertError.message);
    } else {
        console.log("Insert Test Success: All columns exist!");
    }
}

checkSubjectSchema();
