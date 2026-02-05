import { Router } from 'express';
import { checkPermission } from '../../rbac/rbac.middleware';
import { PERMISSIONS } from '../../rbac/permissions';
import { supabase } from '../../config/supabase';

export const attendanceRouter = Router();

// ======================================
// MARKING (Faculty)
// ======================================

// POST /session (Create session if not exists)
attendanceRouter.post('/session',
    checkPermission(PERMISSIONS.ATTENDANCE_MARK),
    async (req, res) => {
        const schoolId = req.context!.user.school_id;
        const userId = req.context!.user.id;
        const { academic_year_id, section_id, date } = req.body;

        if (!academic_year_id || !section_id || !date) return res.status(400).json({ error: "Missing fields" });

        // Validate faculty assignment? (Skipped for MVP, reliant on RLS)

        const { data, error } = await supabase
            .from('attendance_sessions')
            .insert({
                school_id: schoolId,
                academic_year_id,
                section_id,
                date,
                marked_by: userId
            })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') { // Unique violation means already exists, return existing
                const { data: existing } = await supabase
                    .from('attendance_sessions')
                    .select('*')
                    .eq('section_id', section_id)
                    .eq('date', date)
                    .single();
                return res.json(existing);
            }
            return res.status(500).json({ error: error.message });
        }

        res.status(201).json(data);
    }
);

// POST /session/:id/mark (Bulk upsert records)
attendanceRouter.post('/session/:id/records',
    checkPermission(PERMISSIONS.ATTENDANCE_MARK),
    async (req, res) => {
        const sessionId = req.params.id;
        const { records } = req.body; // Array of { student_id, status }

        if (!Array.isArray(records)) return res.status(400).json({ error: "Records must be array" });

        // Use atomic upsert with onConflict to avoid duplicate key errors
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
