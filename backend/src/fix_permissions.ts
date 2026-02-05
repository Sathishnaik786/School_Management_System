import { supabase } from './config/supabase';

async function fixPermissions() {
    console.log('Fixing Dashboard and Assignment permissions...');

    // 1. Get Roles
    const { data: roles } = await supabase.from('roles').select('id, name');
    const adminRole = roles?.find(r => r.name === 'ADMIN');
    const facultyRole = roles?.find(r => r.name === 'FACULTY');
    const parentRole = roles?.find(r => r.name === 'PARENT');

    if (!adminRole || !facultyRole) {
        console.error('Core roles missing. Admin:', !!adminRole, 'Faculty:', !!facultyRole);
        return;
    }

    // 2. Define permissions to ensure
    const permsToEnsure = [
        { code: 'DASHBOARD_VIEW_ADMIN', description: 'View Admin Dashboard' },
        { code: 'DASHBOARD_VIEW_FACULTY', description: 'View Faculty Dashboard' },
        { code: 'DASHBOARD_VIEW_PARENT', description: 'View Parent Dashboard' },
        { code: 'assignment.create', description: 'Create Assignments' },
        { code: 'assignment.edit', description: 'Edit Assignments' },
        { code: 'assignment.delete', description: 'Delete Assignments' },
        { code: 'assignment.view', description: 'View Assignments' },
        { code: 'assignment.grade', description: 'Grade Submissions' }
    ];

    for (const perm of permsToEnsure) {
        await supabase.from('permissions').upsert(perm, { onConflict: 'code' });
    }

    // 3. Get all permission IDs
    const { data: allPerms } = await supabase.from('permissions').select('id, code');
    const getPermId = (code: string) => allPerms?.find(p => p.code === code)?.id;

    // 4. Assign Admin Permissions
    // Add Exam & Subject permissions for Admin
    const adminPermCodes = [
        ...permsToEnsure.map(p => p.code),
        'EXAM_CREATE',
        'EXAM_VIEW',
        'SUBJECT_CREATE',
        'SUBJECT_VIEW',
        'MARKS_VIEW',
        'MARKS_ENTER',
        'ACADEMIC_ASSIGN_FACULTY',
        'ACADEMIC_REMOVE_FACULTY',
        'ACADEMIC_VIEW_ASSIGNMENTS',
        'STUDENT_VIEW',
        'CLASS_VIEW',
        'SECTION_VIEW'
    ];

    // Ensure Exam permissions exist in DB
    const examPerms = [
        { code: 'EXAM_CREATE', description: 'Create Exams' },
        { code: 'EXAM_VIEW', description: 'View Exams' },
        { code: 'SUBJECT_CREATE', description: 'Create Subjects' },
        { code: 'MARKS_VIEW', description: 'View Marks' }
    ];
    for (const perm of examPerms) {
        await supabase.from('permissions').upsert(perm, { onConflict: 'code' });
    }

    // Refresh again to capture new inserts
    const { data: refreshedPermsForAdmin } = await supabase.from('permissions').select('id, code');
    const getAdminPermId = (code: string) => refreshedPermsForAdmin?.find(p => p.code === code)?.id;

    const adminRolePerms = adminPermCodes.map(code => ({
        role_id: adminRole.id,
        permission_id: getAdminPermId(code)
    })).filter(rp => rp.permission_id);

    await supabase.from('role_permissions').upsert(adminRolePerms, { onConflict: 'role_id,permission_id' });

    // 5. Assign Faculty Permissions
    const facultyPermCodes = [
        'DASHBOARD_VIEW_FACULTY',
        'assignment.create',
        'assignment.edit',
        'assignment.delete',
        'assignment.view',
        'assignment.grade',
        'ATTENDANCE_MARK',
        'ATTENDANCE_VIEW',
        'TIMETABLE_VIEW_SELF',
        'MARKS_ENTER',
        'SUBJECT_VIEW',
        'STUDENT_VIEW',
        'SECTION_VIEW',
        'CLASS_VIEW',
        'EXAM_VIEW',
        'MARKS_VIEW'
    ];

    // Ensure basic academic permissions exist if not already there
    const extraPermsArr = [
        { code: 'ATTENDANCE_MARK', description: 'Mark student attendance' },
        { code: 'ATTENDANCE_VIEW', description: 'View attendance records' },
        { code: 'TIMETABLE_VIEW_SELF', description: 'View personal timetable' },
        { code: 'MARKS_ENTER', description: 'Enter exam marks' },
        { code: 'SUBJECT_VIEW', description: 'View subjects' },
        { code: 'STUDENT_VIEW', description: 'View student list' },
        { code: 'SECTION_VIEW', description: 'View sections' },
        { code: 'CLASS_VIEW', description: 'View classes' },
        { code: 'ACADEMIC_ASSIGN_FACULTY', description: 'Assign faculty to sections' },
        { code: 'ACADEMIC_REMOVE_FACULTY', description: 'Remove faculty from sections' },
        { code: 'ACADEMIC_VIEW_ASSIGNMENTS', description: 'View all faculty-student assignments' }
    ];
    for (const perm of extraPermsArr) {
        await supabase.from('permissions').upsert(perm, { onConflict: 'code' });
    }

    // Refresh allPerms
    const { data: refreshedPerms } = await supabase.from('permissions').select('id, code');
    const getRefPermId = (code: string) => refreshedPerms?.find(p => p.code === code)?.id;

    const facultyRolePerms = facultyPermCodes.map(code => ({
        role_id: facultyRole.id,
        permission_id: getRefPermId(code)
    })).filter(rp => rp.permission_id);

    const { error: facError } = await supabase.from('role_permissions').upsert(facultyRolePerms, { onConflict: 'role_id,permission_id' });
    if (facError) console.error('Faculty Perm Insert Error:', facError);

    // 6. Assign Parent Permissions
    if (parentRole) {
        const parentPermCodes = ['DASHBOARD_VIEW_PARENT', 'STUDENT_VIEW_SELF', 'PAYMENT_VIEW_SELF', 'ATTENDANCE_VIEW_SELF'];
        const parentRolePerms = parentPermCodes.map(code => ({
            role_id: parentRole.id,
            permission_id: getRefPermId(code)
        })).filter(rp => rp.permission_id);
        await supabase.from('role_permissions').upsert(parentRolePerms, { onConflict: 'role_id,permission_id' });
    }

    console.log('Permissions fixed successfully.');
}

fixPermissions();
