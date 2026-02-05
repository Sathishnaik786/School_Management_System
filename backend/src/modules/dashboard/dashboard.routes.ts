import { Router } from 'express';
import { checkPermission } from '../../rbac/rbac.middleware';
import { PERMISSIONS } from '../../rbac/permissions';
import { supabase } from '../../config/supabase';

export const dashboardRouter = Router();

// ======================================
// ADMIN OVERVIEW
// ======================================
dashboardRouter.get('/admin/overview',
    checkPermission(PERMISSIONS.DASHBOARD_VIEW_ADMIN),
    async (req, res) => {
        const schoolId = req.context!.user.school_id;

        try {
            const [
                { count: students },
                { count: classes },
                { count: exams },
                { count: pendingAdmissions },
                { count: totalApplications }
            ] = await Promise.all([
                supabase.from('students').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).eq('status', 'active'),
                supabase.from('classes').select('*', { count: 'exact', head: true }).eq('school_id', schoolId),
                supabase.from('exams').select('*', { count: 'exact', head: true }).eq('school_id', schoolId),
                supabase.from('admissions').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).in('status', ['submitted', 'under_review']),
                supabase.from('admissions').select('*', { count: 'exact', head: true }).eq('school_id', schoolId),
            ]);

            res.json({
                students: students || 0,
                classes: classes || 0,
                exams: exams || 0,
                pendingAdmissions: pendingAdmissions || 0,
                totalApplications: totalApplications || 0,
                attendanceRate: "85%"
            });

        } catch (err: any) {
            console.error('[DASHBOARD ERROR]', err);
            res.status(500).json({ error: err.message });
        }
    }
);

// ======================================
// FACULTY OVERVIEW
// ======================================
dashboardRouter.get('/faculty/overview',
    checkPermission(PERMISSIONS.DASHBOARD_VIEW_FACULTY),
    async (req, res) => {
        const userId = req.context!.user.id;

        try {
            // 1. Sections Handled
            const { count: sections } = await supabase
                .from('faculty_sections')
                .select('*', { count: 'exact', head: true })
                .eq('faculty_user_id', userId);

            // 2. Today's Classes (Timetable)
            // Need day of week
            const todayIndex = new Date().getDay() || 7; // Sunday=0 -> 7? DB uses 1-7
            // DB constraint: day_of_week 1-7. JS getDay 0-6 (Sun-Sat).
            // Let's assume 1=Mon, 7=Sun in DB.
            const jsDay = new Date().getDay();
            const dbDay = jsDay === 0 ? 7 : jsDay;

            const { data: todayClasses } = await supabase
                .from('timetable_slots')
                .select('id')
                .eq('faculty_user_id', userId)
                .eq('day_of_week', dbDay);

            res.json({
                sections_count: sections || 0,
                classes_today: todayClasses?.length || 0
            });
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    }
);

// ======================================
// LIVE TIMELINE (Personalized)
// ======================================
dashboardRouter.get('/timeline', async (req, res) => {
    const user = req.context!.user;
    const schoolId = user.school_id;
    const userId = user.id;
    const roles = req.context!.user.roles;

    try {
        let events: any[] = [];

        // 1. ADMISSIONS UPDATES (Relevant for Parent & Admin)
        if (roles.includes('ADMIN') || roles.includes('PARENT')) {
            let query = supabase.from('admission_audit_logs').select(`
                id, action, remarks, created_at,
                admission:admission_id (id, student_name, applicant_user_id)
            `).order('created_at', { ascending: false }).limit(20);

            if (!roles.includes('ADMIN')) {
                // Parent only sees their own child's application events
                // Note: Join filter in Supabase is tricky, might need to filter after or use a better query
            }

            const { data: admissionsEvents } = await query;

            const filteredAdmissions = admissionsEvents?.filter(e => {
                if (roles.includes('ADMIN')) return true;
                return (e as any).admission?.applicant_user_id === userId;
            }).map(e => ({
                id: e.id,
                type: 'ADMISSION',
                title: (e as any).admission?.student_name,
                description: `${e.action}: ${e.remarks || ''}`,
                time: e.created_at,
                icon: 'FileText',
                color: 'amber'
            })) || [];

            events = [...events, ...filteredAdmissions];
        }

        // 2. ATTENDANCE (Relevant for Faculty & Parent)
        if (roles.includes('ADMIN') || roles.includes('FACULTY') || roles.includes('PARENT')) {
            let query = supabase.from('attendance_sessions').select(`
                id, date, created_at, marked_by,
                section:section_id (name, class:class_id (name))
            `).order('created_at', { ascending: false }).limit(20);

            if (roles.includes('FACULTY')) {
                query = query.eq('marked_by', userId);
            }

            const { data: attSessions } = await query;
            const filteredAtt = attSessions?.map(s => ({
                id: s.id,
                type: 'ATTENDANCE',
                title: `${(s as any).section?.class?.name} - ${(s as any).section?.name}`,
                description: `Attendance marked for ${new Date(s.date).toLocaleDateString()}`,
                time: s.created_at,
                icon: 'UserCheck',
                color: 'emerald'
            })) || [];

            events = [...events, ...filteredAtt];
        }

        // 3. ASSIGNMENTS
        if (roles.includes('ADMIN') || roles.includes('FACULTY') || roles.includes('PARENT')) {
            const { data: assignments } = await supabase.from('assignments').select(`
                id, title, created_at, teacher_user_id,
                section:section_id (name, class:class_id (name))
            `).order('created_at', { ascending: false }).limit(20);

            const filteredAssignments = assignments?.filter(a => {
                if (roles.includes('ADMIN')) return true;
                if (roles.includes('FACULTY')) return a.teacher_user_id === userId;
                return true; // Parent sees all (ideally filtered by child section, but let's allow for now)
            }).map(a => ({
                id: a.id,
                type: 'ASSIGNMENT',
                title: a.title,
                description: `New assignment in ${(a as any).section?.class?.name}`,
                time: a.created_at,
                icon: 'BookOpen',
                color: 'indigo'
            })) || [];

            events = [...events, ...filteredAssignments];
        }

        // 4. PAYMENTS (Parent & Admin)
        if (roles.includes('ADMIN') || roles.includes('PARENT')) {
            const { data: payments } = await supabase.from('payments').select(`
                id, amount_paid, payment_date, created_at, student_id,
                student:student_id (full_name)
            `).order('created_at', { ascending: false }).limit(20);

            const filteredPayments = payments?.map(p => ({
                id: p.id,
                type: 'PAYMENT',
                title: `Fee Payment: Rs. ${p.amount_paid}`,
                description: `Received for ${(p as any).student?.full_name}`,
                time: p.created_at,
                icon: 'CreditCard',
                color: 'emerald'
            })) || [];

            events = [...events, ...filteredPayments];
        }

        // Final sort and limit
        events = events.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 15);

        res.json(events);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// ======================================
// PARENT OVERVIEW
// ======================================
dashboardRouter.get('/parent/overview',
    checkPermission(PERMISSIONS.DASHBOARD_VIEW_PARENT),
    async (req, res) => {
        const userId = req.context!.user.id;
        // 1. Fetch children summary (Enrolled Students)
        const { data: children } = await supabase
            .from('student_parents')
            .select(`
                 student_id,
                 student:student_id (
                     full_name, student_code, status,
                     attendance:student_attendance_summary(attendance_percentage),
                     exam_stats:student_exam_summary(percentage),
                     faculty_assignments:student_faculty_assignments (
                         faculty:faculty_id (id, full_name, email)
                     )
                 )
             `)
            .eq('parent_user_id', userId);

        // 2. Fetch Active Admissions (In-progress)
        const { data: admissions } = await supabase
            .from('admissions')
            .select('*')
            .eq('applicant_user_id', userId)
            .not('status', 'in', '("enrolled", "rejected")');

        res.json({
            children: children || [],
            admissions: admissions || []
        });
    }
);
