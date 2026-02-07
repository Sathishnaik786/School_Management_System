import { supabase } from '../../../config/supabase';

export const ResultPublishService = {
    async publishExamResults(examId: string, userId: string): Promise<{ count: number }> {
        // 1. Check if exam exists and has results
        const { count, error: countError } = await supabase
            .from('student_result_summaries')
            .select('*', { count: 'exact', head: true })
            .eq('exam_id', examId);

        if (countError) throw countError;
        if (count === 0) {
            throw new Error("No results found for this exam. Cannot publish.");
        }

        // 2. Update is_published = true for ALL students in this exam
        const { data, error } = await supabase
            .from('student_result_summaries')
            .update({
                is_published: true,
                published_at: new Date().toISOString(),
                published_by: userId
            })
            .eq('exam_id', examId)
            .select();

        if (error) throw error;

        // 3. Log Audit
        await supabase
            .from('exam_audit_logs')
            .insert({
                entity_type: 'RESULT',
                entity_id: examId, // Linking to Exam ID as the entity being published
                action: 'PUBLISH',
                performed_by: userId,
                reason: `Published results for ${count} students.`
            });

        return { count: data?.length || 0 };
    },

    async isExamPublished(examId: string): Promise<boolean> {
        // Check if ANY result in this exam is published. 
        // We assume atomic publish for whole exam, but structure allows per-student.
        // We check one record to be fast.
        const { data } = await supabase
            .from('student_result_summaries')
            .select('is_published')
            .eq('exam_id', examId)
            .eq('is_published', true)
            .limit(1);

        return !!(data && data.length > 0);
    },

    // Check specifically for a student (for marks entry guard)
    async isStudentResultPublished(examId: string, studentId: string): Promise<boolean> {
        const { data } = await supabase
            .from('student_result_summaries')
            .select('is_published')
            .eq('exam_id', examId)
            .eq('student_id', studentId)
            .single();

        return !!data?.is_published;
    }
};
