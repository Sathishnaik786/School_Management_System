import { supabase } from '../../../../config/supabase';
import { BaseRepository } from '../../../admission/repositories/BaseRepository';

export class PublishedQuestionRepository extends BaseRepository<any> {
    constructor() {
        super('assessment_published_questions');
    }

    public async savePublishedQuestions(publishedSectionId: string, questionsList: any[]): Promise<any[]> {
        const payload = [];

        for (const item of questionsList) {
            // Find option and asset snapshot mapping
            const questionId = item.question.id;
            
            const { data: options } = await supabase
                .from('assessment_question_options')
                .select('*')
                .eq('question_id', questionId);

            const { data: assets } = await supabase
                .from('assessment_question_assets')
                .select('*')
                .eq('question_id', questionId);

            payload.push({
                published_section_id: publishedSectionId,
                question_snapshot: item.question,
                options_snapshot: options || [],
                asset_snapshot: assets || [],
                answer_key_snapshot: (options || []).filter(o => o.is_correct),
                question_order: item.sort_order,
                option_order: (options || []).map((o, idx) => ({ id: o.id, sort_order: idx + 1 })),
                section_order: item.sort_order
            });
        }

        const { data, error } = await supabase
            .from(this.tableName)
            .insert(payload)
            .select();

        if (error) throw error;
        return data || [];
    }
}
export default PublishedQuestionRepository;
