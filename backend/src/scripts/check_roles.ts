import { supabase } from '../config/supabase';

async function checkRoles() {
    const { data, error } = await supabase.from('roles').select('id, name');
    if (error) {
        console.error("Error fetching roles:", error.message);
    } else {
        console.log("Roles list:");
        data?.forEach(r => console.log(`- ${r.name} (${r.id})`));
    }
}

checkRoles();
