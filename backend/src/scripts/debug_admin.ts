import { supabase } from '../config/supabase';

async function debug() {
    console.log("--- DEBUG ADMIN USER ---");
    const email = 'admin@school.com';

    // 1. Fetch Admin User
    const { data: user, error } = await supabase
        .from('users')
        .select('id, school_id, email, user_roles(role:roles(name))')
        .eq('email', email)
        .single();

    if (error || !user) {
        console.error("User not found or error:", error?.message);
        return;
    }

    console.log(`User: ${user.email}`);
    console.log(`School ID: ${user.school_id}`);
    console.log(`Roles:`, (user as any).user_roles?.map((r: any) => r.role?.name));

    // 2. Fetch ANY Faculty Profile to compare
    const { data: faculty } = await supabase
        .from('faculty_profiles')
        .select('user:user_id(school_id, email)')
        .limit(3);

    console.log("\n--- EXISTING FACULTY SAMPLES ---");
    faculty?.forEach((f: any, i) => {
        console.log(`[${i}] FacultyEmail: ${f.user?.email} | FacultySchool: ${f.user?.school_id}`);
        console.log(`    Match Admin School? ${f.user?.school_id === user.school_id}`);
    });
}

debug();
