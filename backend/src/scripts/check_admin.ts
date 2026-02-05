import { supabase } from '../config/supabase';

async function checkAdmin() {
    console.log("Checking admin@school.com in public.users...");
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', 'admin@school.com')
        .single();

    if (error) {
        console.error("Error:", error.message);
    } else {
        console.log("User Data:", JSON.stringify(data, null, 2));
    }
}

checkAdmin();
