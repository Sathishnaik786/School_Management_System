
import { supabase } from '../config/supabase';

async function listPermissions() {
    const { data, error } = await supabase.from('permissions').select('*').order('code');
    if (error) {
        console.error(error);
        return;
    }
    console.log("Existing Permissions:");
    data.forEach(p => console.log(`- ${p.code} (${p.description})`));
}

listPermissions();
