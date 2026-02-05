import { Router } from 'express';
import { checkPermission } from '../../rbac/rbac.middleware';
import { PERMISSIONS } from '../../rbac/permissions';
import { supabase } from '../../config/supabase';
import { z } from 'zod';

export const examRouter = Router();

// ======================================
// SUBJECTS
// ======================================

// GET /subjects?classId=
examRouter.get('/subjects',
    checkPermission(PERMISSIONS.SUBJECT_VIEW),
    async (req, res) => {
        try {
            const classId = req.query.classId as string;
            const schoolId = req.context!.user.school_id;

            // Handle invalid/undefined classId explicitly
            if (!classId || classId === 'undefined') {
                return res.json([]); // Return empty list instead of crashing or querying all
            }

            let query = supabase
                .from('subjects')
                .select('*, class:class_id(name)')
                .eq('school_id', schoolId)
                .order('name');

            if (classId) query = query.eq('class_id', classId);

            const { data, error } = await query;
            if (error) throw error;
            res.json(data);
        } catch (err: any) {
            console.error("GET /subjects Error:", err);
            res.status(500).json({ error: err.message });
        }
    }
);

// POST /subjects
examRouter.post('/subjects',
    checkPermission(PERMISSIONS.SUBJECT_CREATE),
    async (req, res) => {
        const schoolId = req.context!.user.school_id;
        const { class_id, name, code } = req.body;

        if (!class_id || !name) return res.status(400).json({ error: "Missing fields" });

        const { data, error } = await supabase
            .from('subjects')
            .insert({ school_id: schoolId, class_id, name, code })
            .select()
            .single();

        if (error) return res.status(500).json({ error: error.message });
        res.status(201).json(data);
    }
);

// ======================================
// EXAMS
// ======================================

// GET /exams
examRouter.get('/',
    checkPermission(PERMISSIONS.EXAM_VIEW),
    async (req, res) => {
        try {
            const schoolId = req.context!.user.school_id;

            const { data, error } = await supabase
                .from('exams')
                .select('*, academic_year:academic_year_id(year_label)')
                .eq('school_id', schoolId)
                .order('start_date', { ascending: false });

            if (error) throw error;
            res.json(data);
        } catch (err: any) {
            console.error("GET /exams Error:", err);
            res.status(500).json({ error: err.message || "Internal Server Error" });
        }
    }
);

// POST /exams
examRouter.post('/',
    checkPermission(PERMISSIONS.EXAM_CREATE),
    async (req, res) => {
        const schoolId = req.context!.user.school_id;
        const { name, academic_year_id, start_date, end_date } = req.body;

        const { data, error } = await supabase
            .from('exams')
            .insert({ school_id: schoolId, name, academic_year_id, start_date, end_date })
            .select()
            .single();

        if (error) return res.status(500).json({ error: error.message });
        res.status(201).json(data);
    }
);

// ======================================
// MARKS
// ======================================

// GET /marks/student/:studentId
examRouter.get('/marks/student/:studentId',
    checkPermission(PERMISSIONS.MARKS_VIEW),
    async (req, res) => {
        const { studentId } = req.params;
        const { examId } = req.query; // Optional filter

        // RLS handles visibility check (Parent vs Staff)
        let query = supabase
            .from('marks')
            .select(`
            marks_obtained, entered_at,
            exam:exam_id(name),
            subject:subject_id(name, code)
        `)
            .eq('student_id', studentId);

        if (examId) query = query.eq('exam_id', examId);

        const { data, error } = await query;
        if (error) return res.status(500).json({ error: error.message });
        res.json(data);
    }
);

// GET /marks/my (Parent/Student Shortcut)
examRouter.get('/marks/my',
    checkPermission(PERMISSIONS.MARKS_VIEW),
    async (req, res) => {
        try {
            const userId = req.context!.user.id; // Parent ID

            // 1. Find linked students
            const { data: links } = await supabase
                .from('student_parents')
                .select('student_id')
                .eq('parent_user_id', userId);

            // If no children linked (or Faculty causing this route to be hit), return empty.
            if (!links || links.length === 0) return res.json([]);

            const studentIds = links.map(l => l.student_id);

            // 2. Fetch marks
            const { data, error } = await supabase
                .from('marks')
                .select(`
                student_id, marks_obtained,
                student:student_id(full_name),
                exam:exam_id(name),
                subject:subject_id(name)
            `)
                .in('student_id', studentIds)
                .order('entered_at', { ascending: false });

            if (error) throw error;
            res.json(data);
        } catch (err: any) {
            console.error("GET /marks/my Error:", err);
            res.status(500).json({ error: err.message });
        }
    }
);

// POST /marks (Bulk or Single Entry)
examRouter.post('/marks',
    checkPermission(PERMISSIONS.MARKS_ENTER),
    async (req, res) => {
        try {
            const userId = req.context!.user.id;
            const { student_id, exam_id, subject_id, marks_obtained } = req.body;

            if (!student_id || !exam_id || !subject_id) {
                return res.status(400).json({ error: "Missing required IDs (student, exam, or subject)" });
            }

            // TODO: Verify Faculty Section Assignment for Strict Control

            const { data, error } = await supabase
                .from('marks')
                .upsert({
                    student_id,
                    exam_id,
                    subject_id,
                    marks_obtained,
                    entered_by: userId,
                    entered_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;
            res.json(data);
        } catch (err: any) {
            console.error("POST /marks Error:", err);
            res.status(500).json({ error: err.message });
        }
    }
);
