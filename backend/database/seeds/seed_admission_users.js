const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
const defaultPassword = process.env.DEFAULT_DEMO_PASSWORD || 'Welcome#321';

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY / SUPABASE_KEY in env.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const TARGET_USERS = [
    { email: 'receptionist@edu.in', name: 'Sarah Receptionist', role: 'RECEPTIONIST' },
    { email: 'counselor@edu.in', name: 'Nancy Counselor', role: 'COUNSELOR' },
    { email: 'examcell@edu.in', name: 'Alex Exam Cell', role: 'EXAM_CELL_ADMIN' },
    { email: 'financeofficer@edu.in', name: 'Robert Finance', role: 'FINANCE_OFFICER' },
    { email: 'principal@edu.in', name: 'Dr. Arthur Principal', role: 'HEAD_OF_INSTITUTE' }
];

async function seed() {
    try {
        console.log('--- Phase 1: Resolving School & Year ---');
        const { data: schools } = await supabase.from('schools').select('id').order('created_at', { ascending: true }).limit(1);
        if (!schools || schools.length === 0) {
            throw new Error('No schools found in the database.');
        }
        const schoolId = schools[0].id;

        console.log('--- Phase 2: Resolving Casing Status & Schema ---');
        // Retrieve dynamic active status
        const { data: adminProfile } = await supabase.from('users').select('status').eq('email', 'admin@edu.in').maybeSingle();
        const activeStatus = adminProfile?.status || 'active';

        // Check if login_status column exists safely
        let hasLoginStatusColumn = false;
        try {
            const { error: columnError } = await supabase.from('users').select('login_status').limit(1);
            if (!columnError) {
                hasLoginStatusColumn = true;
                console.log('✅ Verified schema contains public.users.login_status column.');
            } else {
                console.log('⚠️ public.users.login_status column missing or inaccessible. Skipping assignment.');
            }
        } catch (e) {
            hasLoginStatusColumn = false;
            console.log('⚠️ Error querying login_status column. Skipping assignment.');
        }
        console.log('--- Phase 2.5: Ensuring Standard Roles Exist ---');
        const defaultRoles = [
            { name: 'RECEPTIONIST', description: 'Front-desk receptionist logging walk-in visitors' },
            { name: 'COUNSELOR', description: 'Admissions counselor responsible for follow-ups' },
            { name: 'EXAM_CELL_ADMIN', description: 'Exam cell administrator managing tests' },
            { name: 'FINANCE_OFFICER', description: 'Finance officer handling fees' }
        ];
        for (const r of defaultRoles) {
            await supabase.from('roles').upsert(r, { onConflict: 'name' });
        }

        console.log('--- Phase 3: Resolving Database Role Maps ---');
        const { data: dbRoles } = await supabase.from('roles').select('id, name');
        const rolesMap = {};
        dbRoles?.forEach(r => {
            rolesMap[r.name.toUpperCase()] = r.id;
        });

        const getRoleId = (roleName) => {
            const normalized = roleName.toUpperCase();
            if (rolesMap[normalized]) return rolesMap[normalized];
            if (normalized === 'COUNSELOR' && rolesMap['COUNSELLOR']) return rolesMap['COUNSELLOR'];
            if (normalized === 'FINANCE_OFFICER' && rolesMap['ACCOUNTANT']) return rolesMap['ACCOUNTANT'];
            if (normalized === 'HEAD_OF_INSTITUTE' && rolesMap['HOI']) return rolesMap['HOI'];
            if (normalized === 'EXAM_CELL_ADMIN' && rolesMap['EXAM_CELL']) return rolesMap['EXAM_CELL'];
            return null;
        };

        console.log('--- Phase 3.5: Ensuring Role Permission Maps ---');
        const rolePermissionMap = {
            RECEPTIONIST: ['admission.enquiry.create', 'admission.enquiry.view', 'admission.visitors.manage'],
            COUNSELOR: ['admission.enquiry.view', 'admission.leads.manage', 'admission.application.view', 'admission.document.upload', 'admission.document.view', 'admission.document.download'],
        };
        const { data: allPerms } = await supabase.from('permissions').select('id, code');
        const permByCode = {};
        allPerms?.forEach(p => { permByCode[p.code] = p.id; });

        for (const [roleName, permCodes] of Object.entries(rolePermissionMap)) {
            const roleId = getRoleId(roleName);
            if (!roleId) continue;
            for (const code of permCodes) {
                const permId = permByCode[code];
                if (!permId) continue;
                await supabase.from('role_permissions').upsert(
                    { role_id: roleId, permission_id: permId },
                    { onConflict: 'role_id,permission_id' },
                );
            }
        }

        console.log('--- Phase 4: Seeding Users via Admin Auth SDK ---');
        // Fetch Auth list ONCE before loop
        const { data: { users: authUsers }, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) throw listError;

        for (const target of TARGET_USERS) {
            console.log(`Processing: ${target.email}`);
            
            const authUser = authUsers.find(u => u.email === target.email);
            let userId;

            if (!authUser) {
                const { data: newAuthUser, error: authError } = await supabase.auth.admin.createUser({
                    email: target.email,
                    password: defaultPassword,
                    email_confirm: true
                });

                if (authError) {
                    console.error(`❌ Error creating auth user ${target.email}:`, authError.message);
                    continue;
                }
                userId = newAuthUser.user.id;
                console.log(`✅ Auth user created: ${target.email} (${userId})`);
            } else {
                userId = authUser.id;
                console.log(`ℹ️ Auth user already exists: ${target.email} (${userId})`);
            }

            // Dynamically construct profile payload based on column existence
            const profilePayload = {
                id: userId,
                school_id: schoolId,
                full_name: target.name,
                email: target.email,
                status: activeStatus
            };
            if (hasLoginStatusColumn) {
                profilePayload.login_status = 'APPROVED';
            }

            // Upsert public profile with strict onConflict config
            const { error: profileError } = await supabase
                .from('users')
                .upsert(profilePayload, { onConflict: 'id' });

            if (profileError) {
                console.error(`❌ Error upserting public profile ${target.email}:`, profileError.message);
                continue;
            }

            // Map user role
            const roleId = getRoleId(target.role);
            if (roleId) {
                const { error: roleMapError } = await supabase
                    .from('user_roles')
                    .upsert({
                        user_id: userId,
                        role_id: roleId
                    }, { onConflict: 'user_id,role_id' });

                if (roleMapError) {
                    console.error(`❌ Error mapping role for ${target.email}:`, roleMapError.message);
                } else {
                    console.log(`✅ Role mapped successfully: ${target.role}`);
                }
            }
        }

        console.log('\n--- Phase 5: Running Automated Health Checks ---');
        const checkEmails = [...TARGET_USERS.map(t => t.email), 'admin@edu.in', 'faculty@edu.in', 'student@edu.in', 'parent@edu.in', 'hoi@edu.in'];
        console.log('Email \t\t\t | Auth | Profile | Role | Status');
        console.log('------------------------------------------------------------');
        
        const { data: { users: postAuthUsers } } = await supabase.auth.admin.listUsers();
        
        for (const email of checkEmails) {
            const authExists = postAuthUsers.some(u => u.email === email);
            const { data: profile } = await supabase.from('users').select('id, status, login_status').eq('email', email).maybeSingle();
            const profileExists = !!profile;

            let roleMapped = false;
            if (profile) {
                const { data: ur } = await supabase.from('user_roles').select('role_id').eq('user_id', profile.id);
                roleMapped = ur && ur.length > 0;
            }

            const statusMatch = profile ? (profile.status === activeStatus) : false;
            const loginStatusMatch = profile ? (!hasLoginStatusColumn || profile.login_status === 'APPROVED') : false;
            const statusText = (authExists && profileExists && roleMapped && statusMatch && loginStatusMatch) ? 'PASS ✅' : 'FAIL ❌';
            
            console.log(`${email.padEnd(25)} | ${authExists ? '✅' : '❌'}    | ${profileExists ? '✅' : '❌'}      | ${roleMapped ? '✅' : '❌'}    | ${statusText}`);
        }

        console.log('\n--- Phase 6: Permission Audit Report ---');
        const { data: userRoles } = await supabase.from('user_roles').select('user_id, role_id');
        const { data: allUsers } = await supabase.from('users').select('id, email');
        const { data: allRoles } = await supabase.from('roles').select('id, name');

        const usersMap = {};
        allUsers?.forEach(u => { usersMap[u.id] = u.email; });

        const dbRolesMap = {};
        allRoles?.forEach(r => { dbRolesMap[r.id] = r.name; });

        console.log('Mapped Active Profiles Role Allocations:');
        userRoles?.forEach(ur => {
            const email = usersMap[ur.user_id] || 'Unknown';
            const roleName = dbRolesMap[ur.role_id] || 'Unknown';
            console.log(`- User: ${email} mapped to Role: ${roleName}`);
        });

    } catch (err) {
        console.error('❌ Seeding process encountered a fatal error:', err.message);
    }
}

seed();
