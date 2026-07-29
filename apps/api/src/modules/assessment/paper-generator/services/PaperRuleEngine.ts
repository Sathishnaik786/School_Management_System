import { BaseService } from '../../../admission/services/BaseService';
import { supabase } from '../../../../config/supabase';

export class PaperRuleEngine extends BaseService {
    public async selectQuestionsForRules(
        schoolId: string,
        subjectId: string,
        rules: any[],
        targetCount: number
    ): Promise<any[]> {
        let query = supabase
            .from('assessment_question_bank')
            .select('*')
            .eq('school_id', schoolId)
            .eq('subject_id', subjectId)
            .eq('status', 'APPROVED')
            .eq('is_deleted', false);

        // Apply rules
        for (const rule of rules) {
            if (rule.filter_field === 'difficulty') {
                query = query.eq('difficulty', rule.filter_value);
            } else if (rule.filter_field === 'bloom_level') {
                query = query.eq('bloom_level', rule.filter_value);
            } else if (rule.filter_field === 'course_outcome') {
                query = query.eq('course_outcome_code', rule.filter_value);
            }
        }

        const { data, error } = await query;
        if (error) throw error;

        // Shuffle matched questions pool and take targetCount
        const shuffled = (data || []).sort(() => 0.5 - Math.random());
        return shuffled.slice(0, targetCount);
    }
}
export default PaperRuleEngine;
