import { supabase } from '../config/supabase';
import { env } from '../config/env';

async function debug() {
    console.log("--- DEBUG START ---");
    const { data: rowsSvc, error } = await supabase
        .from('faculty_profiles')
        .select(`
            id,
            user_id,
            user:user_id (id, school_id, email)
        `)
        .limit(5);

    if (error) {
        console.error("Error:", error.message);
    } else {
        console.log(`Fetched ${rowsSvc?.length} profiles.`);
        rowsSvc?.forEach((r: any, i) => {
            const hasUser = !!r.user;
            const school = r.user?.school_id;
            console.log(`[${i}] Profile=${r.id} | UserLinked=${hasUser} | SchoolID='${school}' | UserEmail='${r.user?.email}'`);
        });
    }
    console.log("--- DEBUG END ---");
}

debug().catch(console.error);
