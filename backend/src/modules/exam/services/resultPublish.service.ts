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

        // --- PHASE-5 GATE: ALL SUBJECTS MUST BE LOCKED ---
        const { data: unlockedSchedules } = await supabase
            .from('exam_schedules')
            .select('id')
            .eq('exam_id', examId)
            .eq('results_locked', false);

        if (unlockedSchedules && unlockedSchedules.length > 0) {
            throw new Error(`CANNOT_PUBLISH: ${unlockedSchedules.length} subjects are not yet finalized/locked.`);
        }
        // -------------------------------------------------

        // --- PHASE-R4 SNAPSHOT POPULATION ---
        // Before publishing, we MUST ensure snapshots are populated.
        // We fetch the necessary context for all students in this exam.

        // A. Get Exam's Academic Year
        const { data: examData } = await supabase.from('exams').select('academic_year_id, academic_year:academic_year_id(year_label)').eq('id', examId).single();
        if (!examData) throw new Error("Exam context missing");

        const examYearId = examData.academic_year_id;
        const examYearLabel = (examData.academic_year as any)?.year_label;

        // B. Fetch Student Contexts for this Exam Year
        // We need student_id -> class_name, section_name
        const { data: contexts } = await supabase
            .from('student_result_summaries')
            .select('student_id')
            .eq('exam_id', examId);

        const studentIds = contexts?.map(c => c.student_id) || [];

        if (studentIds.length > 0) {
            // Bulk fetch section info
            const { data: sections } = await supabase
                .from('student_sections')
                .select(`
                    student_id,
                    section:section_id(
                        name,
                        class:class_id(name)
                    )
                `)
                .in('student_id', studentIds)
                .eq('academic_year_id', examYearId);

            // Create Lookup Map
            const contextMap = new Map();
            sections?.forEach((s: any) => {
                if (s.section && s.section.class) {
                    contextMap.set(s.student_id, {
                        className: s.section.class.name,
                        sectionName: s.section.name
                    });
                }
            });

            // C. Perform Updates (Best Effort - Sequential or Batched)
            // We update ONLY if snapshots are NULL to preserve history if re-published (though unlikely)
            // SQL update with FROM clause handles this efficiently in migration, 
            // but here we do it via application logic to be safe and explicit.
            // Since Supabase JS client bulk update is tricky with different values, we loop.
            // OPTIMIZATION: In a massive system, this should be a stored procedure. 
            // For now, `Promise.all` is acceptable for class-level exams.

            await Promise.all(studentIds.map(async (sid) => {
                const ctx = contextMap.get(sid);
                if (ctx) {
                    // Update specific row
                    await supabase
                        .from('student_result_summaries')
                        .update({
                            class_name_snapshot: ctx.className,
                            section_name_snapshot: ctx.sectionName,
                            academic_year_label_snapshot: examYearLabel
                        })
                        .eq('exam_id', examId)
                        .eq('student_id', sid)
                        .is('class_name_snapshot', null); // Condition: Only if NULL
                }
            }));
        }
        // ------------------------------------

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
