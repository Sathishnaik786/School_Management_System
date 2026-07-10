import { supabase } from '../../../../config/supabase';
import { BaseRepository } from '../../../admission/repositories/BaseRepository';

export class QuestionOptionRepository extends BaseRepository<any> {
    constructor() {
        super('assessment_question_options');
    }

    public async findByQuestionId(questionId: string): Promise<any[]> {
        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('question_id', questionId)
            .eq('is_deleted', false);

        if (error) throw error;
        return data || [];
    }

    public async saveOptions(questionId: string, options: any[]): Promise<any[]> {
        // Soft delete old options
        const { error: deleteError } = await supabase
            .from(this.tableName)
            .update({ is_deleted: true })
            .eq('question_id', questionId);

        if (deleteError) throw deleteError;

        if (!options || options.length === 0) return [];

        const payload = options.map(opt => ({
            question_id: questionId,
            option_text: opt.option_text,
            is_correct: opt.is_correct,
            is_deleted: false
        }));

        const { data, error } = await supabase
            .from(this.tableName)
            .insert(payload)
            .select();

        if (error) throw error;
        return data || [];
    }
}
export default QuestionOptionRepository;
