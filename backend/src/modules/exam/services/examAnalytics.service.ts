import { supabase } from '../../../config/supabase';

export const ExamAnalyticsService = {
    // 1. Overview KPIs
    async getExamOverview(examId: string) {
        // Fetch passing students
        const { count: passCount, error: passError } = await supabase
            .from('student_result_summaries')
            .select('*', { count: 'exact', head: true })
            .eq('exam_id', examId)
            .eq('result_status', 'PASS');

        // Fetch failing students
        const { count: failCount, error: failError } = await supabase
            .from('student_result_summaries')
            .select('*', { count: 'exact', head: true })
            .eq('exam_id', examId)
            .eq('result_status', 'FAIL');

        // Total
        const total = (passCount || 0) + (failCount || 0);
        const passPercentage = total > 0 ? ((passCount || 0) / total * 100).toFixed(2) : 0;

        // Average Overall Percentage
        const { data: avgData, error: avgError } = await supabase
            .from('student_result_summaries')
            .select('percentage')
            .eq('exam_id', examId);

        const totalPercentage = avgData?.reduce((sum, r) => sum + (r.percentage || 0), 0) || 0;
        const avgPercentage = total > 0 ? (totalPercentage / total).toFixed(2) : 0;

        return {
            totalStudents: total,
            passCount: passCount || 0,
            failCount: failCount || 0,
            passPercentage: Number(passPercentage),
            avgPercentage: Number(avgPercentage)
        };
    },

    // 2. Grade Distribution
    async getGradeDistribution(examId: string) {
        // We use a raw query or group in JS if needed. 
        // Supabase-js doesn't support GROUP BY directly in ORM easily for aggregates without view or RPC.
        // We will fetch minimal data and aggregate in memory (assuming batch size is reasonable for a school context).

        const { data, error } = await supabase
            .from('student_result_summaries')
            .select('grade')
            .eq('exam_id', examId);

        if (error) throw error;

        const distribution: any = {};
        data?.forEach((r: any) => {
            const grade = r.grade || 'N/A';
            distribution[grade] = (distribution[grade] || 0) + 1;
        });

        // Format for Chart
        return Object.entries(distribution).map(([grade, count]) => ({
            grade, count
        })).sort((a: any, b: any) => a.grade.localeCompare(b.grade));
    },

    // 3. Subject-Wise Performance
    async getSubjectPerformance(examId: string) {
        // Marks table has marks_obtained and max_marks (implied from schedule)
        // We need to group by subject_id.

        // 1. Get all marks for this exam
        const { data: marks, error } = await supabase
            .from('marks')
            .select(`
                marks_obtained,
                subject:subject_id(id, name, code)
            `)
            .eq('exam_id', examId);

        if (error) throw error;

        // 2. Aggregate
        const subjectStats: any = {};

        marks?.forEach((m: any) => {
            const sName = m.subject?.name || 'Unknown';
            const sId = m.subject?.id;

            if (!subjectStats[sId]) {
                subjectStats[sId] = {
                    id: sId,
                    subjectName: sName,
                    totalMarks: 0,
                    count: 0,
                    highest: 0,
                    lowest: 1000 // arbitrarily high
                };
            }

            const obtained = Number(m.marks_obtained);

            subjectStats[sId].totalMarks += obtained;
            subjectStats[sId].count += 1;
            if (obtained > subjectStats[sId].highest) subjectStats[sId].highest = obtained;
            if (obtained < subjectStats[sId].lowest) subjectStats[sId].lowest = obtained;
        });

        return Object.values(subjectStats).map((s: any) => ({
            ...s,
            average: s.count > 0 ? (s.totalMarks / s.count).toFixed(2) : 0,
            lowest: s.lowest === 1000 ? 0 : s.lowest
        }));
    },

    // 4. Top Performers
    async getTopPerformers(examId: string, limit: number = 5) {
        const { data, error } = await supabase
            .from('student_result_summaries')
            .select(`
                total_obtained, percentage, grade,
                student:student_id(full_name, student_code)
            `)
            .eq('exam_id', examId)
            .order('total_obtained', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data;
    }
};
