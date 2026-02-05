import { Router } from 'express';
import { checkPermission } from '../../rbac/rbac.middleware';
import { PERMISSIONS } from '../../rbac/permissions';
import { supabase } from '../../config/supabase';

export const timetableRouter = Router();

// ======================================
// MANAGE (Admin)
// ======================================

// GET /section/:sectionId
timetableRouter.get('/section/:sectionId',
    // Allow VIEW or VIEW_SELF? RLS handles self, but Admin needs to see.
    // We'll trust RLS logic primarily, but let's check general VIEW perms for explicit endpoint access or SELF if section matches.
    // For simplicity, CheckPermission('TIMETABLE_VIEW') is for Staff. Parents use /my endpoint usually.
    // But if Parent calls this with their section ID, RLS allows. So we might need a looser middleware or hybrid.
    // Let's use checkPermission for STAFF view here.
    checkPermission(PERMISSIONS.TIMETABLE_VIEW),
    async (req, res) => {
        const { sectionId } = req.params;

        const { data, error } = await supabase
            .from('timetable_slots')
            .select(`
            id, day_of_week, start_time, end_time,
            subject:subject_id(name, code),
            faculty:faculty_user_id(full_name)
        `)
            .eq('section_id', sectionId)
            .order('day_of_week')
            .order('start_time');

        if (error) return res.status(500).json({ error: error.message });
        res.json(data);
    }
);

// POST /slots (Create)
timetableRouter.post('/slots',
    checkPermission(PERMISSIONS.TIMETABLE_CREATE),
    async (req, res) => {
        const schoolId = req.context!.user.school_id;
        const { academic_year_id, section_id, subject_id, faculty_user_id, day_of_week, start_time, end_time } = req.body;

        try {
            // 1. Validate Overlaps
            // Detect if Section is busy
            const { count: sectionOverlap } = await supabase
                .from('timetable_slots')
                .select('*', { count: 'exact', head: true })
                .eq('section_id', section_id)
                .eq('day_of_week', day_of_week)
                .or(`and(start_time.lte.${end_time},end_time.gte.${start_time})`); // Overlap logic: (StartA <= EndB) and (EndA >= StartB)

            if (sectionOverlap && sectionOverlap > 0) {
                return res.status(409).json({ error: "Conflict: This section already has a class at this time." });
            }

            // Detect if Faculty is busy
            const { count: facultyOverlap } = await supabase
                .from('timetable_slots')
                .select('*', { count: 'exact', head: true })
                .eq('faculty_user_id', faculty_user_id)
                .eq('day_of_week', day_of_week)
                .or(`and(start_time.lte.${end_time},end_time.gte.${start_time})`);

            if (facultyOverlap && facultyOverlap > 0) {
                return res.status(409).json({ error: "Conflict: Faculty is teaching another class at this time." });
            }

            // 2. Insert
            const { data, error } = await supabase
                .from('timetable_slots')
                .insert({
                    school_id: schoolId,
                    academic_year_id,
                    section_id,
                    subject_id,
                    faculty_user_id,
                    day_of_week,
                    start_time,
                    end_time
                })
                .select()
                .single();

            if (error) throw error;
            res.status(201).json(data);

        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    }
);

// DELETE /slots/:id
timetableRouter.delete('/slots/:id',
    checkPermission(PERMISSIONS.TIMETABLE_CREATE),
    async (req, res) => {
        const { id } = req.params;
        const { error } = await supabase.from('timetable_slots').delete().eq('id', id);
        if (error) return res.status(500).json({ error: error.message });
        res.json({ message: "Deleted" });
    }
);

// ======================================
// MY TIMETABLE (Faculty / Student)
// ======================================

// GET /my
timetableRouter.get('/my',
    // Check either VIEW_SELF or VIEW.
    // We can rely on authenticated user context.
    (req, res, next) => next(),
    async (req, res) => {
        const userId = req.context!.user.id;
        const schoolId = req.context!.user.school_id;

        // Determine Role Context
        // If Faculty: Get slots where faculty_user_id = userId
        // If Student: Get slots where section_id IN (sudent's sections)
        // If Parent: Get slots for children

        // Simpler for MVP: Just fetch ALL slots that RLS allows this user to see? 
        // Yes, RLS is configured for "Student view own section" and "Faculty view school".
        // But Faculty wants *their* schedule specifically, not whole school.
        // We need explicit query filters based on role.

        let query = supabase
            .from('timetable_slots')
            .select(`
                id, day_of_week, start_time, end_time,
                subject:subject_id(name),
                section:section_id(name, class:class_id(name)),
                faculty:faculty_user_id(full_name)
            `)
            .order('day_of_week')
            .order('start_time');

        if (req.context!.user.roles.includes('FACULTY')) {
            query = query.eq('faculty_user_id', userId);
        } else {
            // Students/Parents relying on RLS is tricky because RLS allows seeing the WHOLE section schedule, which is what we want.
            // But if Parent has 2 kids in different sections, we want to maybe filter?
            // For now, let RLS filter valid rows. 
        }

        const { data, error } = await query;
        if (error) return res.status(500).json({ error: error.message });
        res.json(data);
    }
);
