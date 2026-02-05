import { supabase } from './config/supabase';

async function debug() {
    console.log('--- DEBUGGING ATTENDANCE PERMS for faculty1@school.com ---');

    // 1. Find User
    const { data: user } = await supabase.from('users').select('*').eq('email', 'faculty1@school.com').single();
    if (!user) {
        console.log('User not found');
        return;
    }
    console.log('User ID:', user.id);

    // 2. Check Roles
    const { data: userRoles } = await supabase.from('user_roles').select('*, roles(name)').eq('user_id', user.id);
    console.log('Roles:', userRoles?.map(ur => (ur.roles as any).name));

    // 3. Check Permissions for these roles
    if (userRoles) {
        for (const ur of userRoles) {
            const { data: perms } = await supabase.from('role_permissions').select('*, permissions(code)').eq('role_id', ur.role_id);
            console.log(`Permissions for ${(ur.roles as any).name}:`, perms?.map(p => (p.permissions as any).code));
        }
    }

    // 4. Check Sections assigned to this faculty
    // Wait, the new automation uses 'section_faculty_assignments'
    const { data: assignments } = await supabase.from('section_faculty_assignments').select('*, section:section_id(name, class:class_id(name))').eq('faculty_id', user.id);
    console.log('Assignments:', assignments?.map(a => `${(a as any).section.class.name} - ${(a as any).section.name} (Status: ${a.status})`));

    // 5. Check if any session exists for a specific section
    if (assignments && assignments.length > 0) {
        const sid = assignments[0].section_id;
        console.log('Checking sessions for section:', sid);
        const { data: sessions } = await supabase.from('attendance_sessions').select('*').eq('section_id', sid).limit(5);
        console.log('Recent sessions:', sessions);
    }
}

debug();
