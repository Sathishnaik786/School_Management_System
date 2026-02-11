
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function test() {
    console.log("Testing classes fetch...");
    // 1. Get User/School Context (Simulation)
    // We can't easily simulate req.context without full middleware, 
    // but we can query classes directly to see if ANY exist.

    // Check admin user school
    const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('email', 'admin@school.com')
        .single();

    if (user) {
        console.log(`User admin@school.com found. School: ${user.school_id}`);
        // Now find classes for THIS school
        const { data: userClasses } = await supabase
            .from('classes')
            .select('*')
            .eq('school_id', user.school_id);
        console.log(`Classes for this user's school: ${userClasses?.length}`);
    } else {
        console.log("User admin@school.com NOT found.");
    }

    const { data: classes, error } = await supabase
        .from('classes')
        .select('*');

    if (error) {
        console.error("Error:", error);
    } else {
        console.log(`Found ${classes.length} classes total.`);
        classes.forEach(c => console.log(`- ${c.name} (School: ${c.school_id})`));
    }
}

test();
