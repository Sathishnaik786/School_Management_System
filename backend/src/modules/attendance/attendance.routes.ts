import { Router } from 'express';
import { checkPermission } from '../../rbac/rbac.middleware';
import { PERMISSIONS } from '../../rbac/permissions';
import { supabase } from '../../config/supabase';

export const attendanceRouter = Router();

// ======================================
// MARKING (Faculty)
// ======================================

// ======================================
// MARKING (Faculty)
// ======================================

// POST /session (Create session if not exists)
attendanceRouter.post('/session',
    checkPermission(PERMISSIONS.ATTENDANCE_MARK),
    async (req, res) => {
        const schoolId = req.context!.user.school_id;
        const userId = req.context!.user.id;
        const { academic_year_id, section_id, date, subject_id, start_time } = req.body; // Added params

        if (!academic_year_id || !section_id || !date) return res.status(400).json({ error: "Missing fields" });

        try {
            // SECURITY: ABAC Enforcement
            // "Use timetable_slots as source of truth"
            // If marking a Subject period, verify User teaches this Subject to this Section at this Time (or generally).
            if (subject_id) {
                // 1. Check specific Timetable Slot (Strongest Check)
                // Get Day of Week (1=Mon)
                const dayOfWeek = new Date(date).getDay() || 7;

                // We check if a slot exists for this Faculty + Section + Subject + Day
                // Note: start_time match is ideal but might drift slightly in practice. 
                // We'll check "Is assigned to this section+subject" generally via timetable OR faculty_section_subjects

                // Let's use timetable_slots for availability check
                const { count: slotCount } = await supabase
                    .from('timetable_slots')
                    .select('*', { count: 'exact', head: true })
                    .eq('school_id', schoolId)
                    .eq('faculty_user_id', userId)
                    .eq('section_id', section_id)
                    .eq('subject_id', subject_id)
                    .eq('day_of_week', dayOfWeek);

                // If not in timetable, check manual assignment override (faculty_section_subjects)
                const { count: assignCount } = await supabase
                    .from('faculty_section_subjects')
                    .select('*', { count: 'exact', head: true })
                    .eq('faculty_profile_id', userId) // Note: This table links faculty_profile_id which is NOT user_id. Wait.
                // schema 042 says: faculty_profile_id REFERENCES faculty_profiles(id). 
                // faculty_profiles has user_id. 
                // This is complex join. Let's rely on Timetable which uses `faculty_user_id` directly (Migration 008). 
                // Much safer.

                if (!slotCount && !req.context!.user.roles.includes('ADMIN')) {
                    // Start_time specific check could be added here if needed
                    return res.status(403).json({ error: "You are not scheduled to teach this class today." });
                }
            } else {
                // Daily Attendance (Homeroom)
                // Check if Class Teacher (faculty_sections)
                const { count: ctCount } = await supabase
                    .from('faculty_sections')
                    .select('*', { count: 'exact', head: true })
                    .eq('faculty_user_id', userId)
                    .eq('section_id', section_id)
                    .in('role', ['class_teacher']);

                if (!ctCount && !req.context!.user.roles.includes('ADMIN')) {
                    return res.status(403).json({ error: "Only Class Teacher can mark daily attendance." });
                }
            }

            // Create Session
            const { data, error } = await supabase
                .from('attendance_sessions')
                .insert({
                    school_id: schoolId,
                    academic_year_id,
                    section_id,
                    date,
                    subject_id: subject_id || null,     // New
                    start_time: start_time || null,     // New
                    marked_by: userId
                })
                .select()
                .single();

            if (error) {
                if (error.code === '23505') { // Unique constraint violation (Daily or Period)
                    // Fetch existing
                    let query = supabase
                        .from('attendance_sessions')
                        .select('*')
                        .eq('section_id', section_id)
                        .eq('date', date);

                    if (start_time) query = query.eq('start_time', start_time);
                    else query = query.is('start_time', null);

                    const { data: existing } = await query.single();
                    return res.json(existing);
                }
                throw error;
            }

            res.status(201).json(data);

        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    }
);

// POST /session/:id/records (Bulk upsert records)
attendanceRouter.post('/session/:id/records',
    checkPermission(PERMISSIONS.ATTENDANCE_MARK),
    async (req, res) => {
        const sessionId = req.params.id;
        const { records } = req.body; // Array of { student_id, status }

        if (!Array.isArray(records)) return res.status(400).json({ error: "Records must be array" });

        // Validate Session Ownership/Access? 
        // We already did it in Create Session. 
        // But attacker could guess ID.
        // Let's rely on RLS 'Staff manage records' -> 'can_mark_attendance'.
        // STRICT: We should ideally verify session.marked_by == user OR admin.
        const { data: session } = await supabase.from('attendance_sessions').select('marked_by').eq('id', sessionId).single();
        if (session && session.marked_by !== req.context!.user.id && !req.context!.user.roles.includes('ADMIN')) {
            return res.status(403).json({ error: "You cannot modify a session marked by another faculty." });
        }

        const { data, error } = await supabase
            .from('attendance_records')
            .upsert(
                records.map((r: any) => ({
                    session_id: sessionId,
                    student_id: r.student_id,
                    status: r.status,
                    marked_at: new Date().toISOString()
                })),
                { onConflict: 'session_id,student_id' }
            )
            .select();

        if (error) {
            console.error('[Attendance] Save Error:', error);
            return res.status(500).json({ error: error.message, details: error.details });
        }
        res.json({ message: "Attendance marked", count: data?.length || 0 });
    }
);

// ======================================
// VIEWS
// ======================================

// GET /section/:sectionId?date=...
attendanceRouter.get('/section/:sectionId',
    checkPermission(PERMISSIONS.ATTENDANCE_VIEW),
    async (req, res) => {
        const { sectionId } = req.params;
        const { date } = req.query;

        if (!date) return res.status(400).json({ error: "Date required" });

        // 1. Get Session
        const { data: session } = await supabase
            .from('attendance_sessions')
            .select('*')
            .eq('section_id', sectionId)
            .eq('date', date)
            .single();

        if (!session) return res.json({ session: null, records: [] });

        // 2. Get Records with student info
        const { data: records, error } = await supabase
            .from('attendance_records')
            .select('*, student:student_id(full_name, student_code)')
            .eq('session_id', session.id);

        if (error) return res.status(500).json({ error: error.message });
        res.json({ session, records });
    }
);

// GET /my (Parent View)
attendanceRouter.get('/my',
    checkPermission(PERMISSIONS.ATTENDANCE_VIEW_SELF),
    async (req, res) => {
        const userId = req.context!.user.id;

        // 1. Find linked students
        const { data: links } = await supabase
            .from('student_parents')
            .select('student_id')
            .eq('parent_user_id', userId);

        if (!links || links.length === 0) return res.json([]);

        const studentIds = links.map(l => l.student_id);

        // 2. Fetch records
        const { data, error } = await supabase
            .from('attendance_records')
            .select(`
                status, marked_at,
                session:session_id(date),
                student:student_id(full_name)
            `)
            .in('student_id', studentIds)
            .order('marked_at', { ascending: false })
            .limit(50);

        if (error) return res.status(500).json({ error: error.message });
        res.json(data);
    }
);
