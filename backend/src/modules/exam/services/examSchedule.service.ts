import { supabase } from '../../../config/supabase';

export const ExamScheduleService = {
    async createSchedule(payload: {
        exam_id: string;
        subject_id: string;
        exam_date: string;
        start_time: string;
        end_time: string;
        max_marks?: number;
        passing_marks?: number;
    }) {
        // Validation: end_time > start_time is handled by DB constraint, 
        // but we can also add logic here if needed.

        const { data, error } = await supabase
            .from('exam_schedules')
            .insert(payload)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async getSchedulesByExam(examId: string) {
        const { data, error } = await supabase
            .from('exam_schedules')
            .select(`
                *,
                subject:subject_id (name, code)
            `)
            .eq('exam_id', examId)
            .order('exam_date', { ascending: true })
            .order('start_time', { ascending: true });

        if (error) throw error;
        return data;
    },

    async deleteSchedule(scheduleId: string) {
        const { error } = await supabase
            .from('exam_schedules')
            .delete()
            .eq('id', scheduleId);

        if (error) throw error;
        return true;
    }
};
