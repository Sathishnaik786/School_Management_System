import { Request, Response } from 'express';
import { supabase } from '../../../config/supabase';

export const ExamResultController = {
    async getStudentResult(req: Request, res: Response) {
        try {
            const { examId, studentId } = req.query;

            if (!examId || !studentId) {
                return res.status(400).json({ error: "Missing required params" });
            }

            // 1. Fetch Summary
            const { data: summary, error: sumError } = await supabase
                .from('student_result_summaries')
                .select('*')
                .eq('exam_id', examId)
                .eq('student_id', studentId)
                .single();

            // 2. Fetch Detailed Marks with Subject Names
            const { data: details, error: detError } = await supabase
                .from('marks')
                .select(`
                    marks_obtained,
                    subject:subject_id(name, code, type)
                `)
                .eq('exam_id', examId)
                .eq('student_id', studentId);

            if (detError) throw detError;

            res.json({
                summary: summary || null,
                details: details || []
            });

        } catch (err: any) {
            console.error("Get Result Error:", err);
            res.status(500).json({ error: err.message });
        }
    }
};
