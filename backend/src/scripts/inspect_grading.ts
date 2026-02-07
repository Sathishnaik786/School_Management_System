
import { supabase } from '../config/supabase';

async function inspectGrading() {
    console.log("Inspecting grading_scales...");

    // 1. Try to fetch one row
    const { data, error } = await supabase.from('grading_scales').select('*').limit(1);

    if (error) {
        console.error("Error fetching grading_scales:", error.message);
        // If error says generic "relation does not exist", the table is missing.
        // If it says "column does not exist", we might get a hint? No, Supabase usually returns structure if it exists.
        return;
    }

    if (data && data.length > 0) {
        console.log("Row found. Keys:", Object.keys(data[0]));
    } else {
        console.log("Table exists but is empty. Cannot infer columns from data.");
        // If empty, let's try to insert a dummy row to fail and see valid columns? 
        // Or better, let's just CREATE the table again if it's empty to be sure.
    }
}

inspectGrading();
