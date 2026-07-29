import { supabase } from '../../../../config/supabase';
import { BaseRepository } from '../../../admission/repositories/BaseRepository';

export class GeneratedQuestionRepository extends BaseRepository<any> {
    constructor() {
        super('assessment_generated_questions');
    }

    public async saveQuestions(sectionId: string, questionIds: string[]): Promise<any[]> {
        const { error: delError } = await supabase
            .from(this.tableName)
            .delete()
            .eq('section_id', sectionId);

        if (delError) throw delError;

        if (!questionIds || questionIds.length === 0) return [];

        const payload = questionIds.map((qId, i) => ({
            section_id: sectionId,
            question_id: qId,
            sort_order: i + 1
        }));

        const { data, error } = await supabase
            .from(this.tableName)
            .insert(payload)
            .select();

        if (error) throw error;
        return data || [];
    }
}
export default GeneratedQuestionRepository;
