
import { supabase } from '../config/supabase';

const EXAM_PERMISSIONS = [
    // Exam Core
    'EXAM_CREATE',
    'EXAM_VIEW',
    'MARKS_ENTER',
    'MARKS_VIEW',

    // Subject Management
    'SUBJECT_CREATE',
    'SUBJECT_VIEW',
    'SUBJECT_ASSIGN_FACULTY',

    // Academic Context (Needed to schedule exams for classes)
    'ACADEMIC_VIEW',
    'CLASS_VIEW',
    'SECTION_VIEW',

    // Timetable
    'TIMETABLE_CREATE',
    'TIMETABLE_VIEW',

    // Additional items based on prompt "EXAM_PUBLISH/ANALYTICS"
    'EXAM_PUBLISH',
    'EXAM_ANALYTICS',
    'EXAM_SCHEDULE',
    'EXAM_SEATING',
    'QUESTION_PAPER_MANAGE'
];

const ROLE_NAME = 'EXAM_CELL_ADMIN';

async function setupExamAdmin(targetEmail?: string, targetPassword?: string) {
    console.log(`Setting up ${ROLE_NAME}...`);

    // 1. Create/Get Role
    let roleId = '';
    const { data: role } = await supabase.from('roles').select('id').eq('name', ROLE_NAME).single();

    if (role) {
        console.log("Role exists.");
        roleId = role.id;
    } else {
        console.log("Creating role...");
        const { data: newRole, error } = await supabase.from('roles').insert({
            name: ROLE_NAME,
            description: 'Exam Cell Administrator with restricted access'
        }).select('id').single();

        if (error) throw new Error(error.message);
        roleId = newRole.id;
    }

    // 2. Link Permissions
    console.log("Linking permissions...");
    for (const code of EXAM_PERMISSIONS) {
        // Get Perm ID
        let permId = '';
        const { data: perm } = await supabase.from('permissions').select('id').eq('code', code).single();

        if (perm) {
            permId = perm.id;
        } else {
            console.log(`Permission ${code} not found. Creating...`);
            const { data: newPerm, error: createErr } = await supabase.from('permissions').insert({
                code: code,
                description: `Auto-generated for ${code}`
            }).select('id').single();

            if (createErr) {
                console.error(`Failed to create ${code}: ${createErr.message}`);
                continue;
            }
            permId = newPerm.id;
        }

        // Link
        const { error: linkErr } = await supabase.from('role_permissions').insert({
            role_id: roleId,
            permission_id: permId
        });

        if (linkErr && linkErr.code !== '23505') { // Ignore unique violation
            console.error(`Failed to link ${code}: ${linkErr.message}`);
        }
    }

    // 3. Assign User
    if (targetEmail) {
        console.log(`Assigning role to ${targetEmail}...`);

        // Check if user exists in public.users
        const { data: user } = await supabase.from('users').select('id, email').eq('email', targetEmail).single();

        if (!user) {
            console.log("User not found in public.users table. Attempting to create in Auth...");

            if (!targetPassword) {
                console.error("Cannot create user without password.");
                return;
            }

            // Create user in Auth
            const { data: authUser, error: authError } = await supabase.auth.signUp({
                email: targetEmail,
                password: targetPassword,
                options: {
                    data: {
                        full_name: 'Exam Cell Admin',
                        role: 'EXAM_CELL_ADMIN' // This might invoke a trigger if set up
                    }
                }
            });

            if (authError) {
                console.error(`Auth creation failed: ${authError.message}`);
                // Verify if user exists in Auth but not in public.users
                // Sometimes triggers fail.
                return;
            }

            console.log("User created in Auth. Waiting for trigger/sync...");
            // Simple delay to allow triggers to run
            await new Promise(r => setTimeout(r, 2000));

            // Try fetching from public.users again
            const { data: userRetry } = await supabase.from('users').select('id').eq('email', targetEmail).single();

            if (userRetry) {
                console.log("User found in public.users after creation.");
                await assignRole(userRetry.id, roleId);
            } else {
                console.log("User still not in public.users. They might be in Auth only. We cannot assign DB role purely if public.users is missing, unless we insert manually.");
                // Manual insert if trigger failed
                if (authUser.user) {
                    console.log("Manually inserting into public.users...");
                    const { error: insertErr } = await supabase.from('users').insert({
                        id: authUser.user.id,
                        email: targetEmail,
                        full_name: 'Exam Cell Admin',
                        role: 'EXAM_CELL_ADMIN' // Legacy column if exists
                    });
                    if (insertErr) console.error("Manual insert failed", insertErr);
                    else {
                        console.log("Manual insert success.");
                        await assignRole(authUser.user.id, roleId);
                    }
                }
            }

        } else {
            // User exists
            await assignRole(user.id, roleId);
        }
    }
}

async function assignRole(userId: string, roleId: string) {
    const { error: assignErr } = await supabase.from('user_roles').insert({
        user_id: userId,
        role_id: roleId
    });

    if (assignErr) {
        if (assignErr.code === '23505') console.log("User already has this role.");
        else console.error(`Role assignment failed: ${assignErr.message}`);
    } else {
        console.log("User assigned successfully.");
    }
}

const targetArgs = process.argv.slice(2);
const email = targetArgs[0];
const password = targetArgs[1];

setupExamAdmin(email, password).catch(console.error);
