import { supabase } from '../config/supabase';

async function debug() {
    // 1. Get a Faculty Profile School ID
    const { data: facultyRows } = await supabase
        .from('faculty_profiles')
        .select('user:user_id(school_id)')
        .limit(1);

    const facultySchool = (facultyRows as any)?.[0]?.user?.school_id;
    console.log("FACULTY_SCHOOL_ID:", facultySchool);

    // 2. Get Admin School ID
    // Note: Adjust email if user is logged in as someone else
    const { data: admin } = await supabase
        .from('users')
        .select('id, school_id, email, user_roles(role:roles(name))')
        .eq('email', 'sathishnaikislavath@gmail.com')
        .single();

    console.log("ADMIN_SCHOOL_ID:  ", admin?.school_id);
    console.log("ADMIN_ROLES:      ", (admin as any)?.user_roles?.map((r: any) => r.role?.name));

    if (facultySchool && admin?.school_id && facultySchool !== admin.school_id) {
        console.log("!!! MISMATCH DETECTED !!!");
    } else if (facultySchool && facultySchool === admin?.school_id) {
        console.log("MATCH CONFIRMED.");
    }
}

debug();
