import { supabase } from '../../../../config/supabase';
import { BaseRepository } from '../../../admission/repositories/BaseRepository';

export class GeneratedSectionRepository extends BaseRepository<any> {
    constructor() {
        super('assessment_generated_sections');
    }

    public async saveSections(paperId: string, sections: any[]): Promise<any[]> {
        const { error: delError } = await supabase
            .from(this.tableName)
            .delete()
            .eq('paper_id', paperId);

        if (delError) throw delError;

        if (!sections || sections.length === 0) return [];

        const payload = sections.map((sec, i) => ({
            paper_id: paperId,
            section_name: sec.section_name,
            description: sec.description || null,
            points_per_question: sec.points_per_question || 1.00,
            negative_marks: sec.negative_marks || 0.00,
            total_questions: sec.total_questions,
            sort_order: sec.sort_order || (i + 1)
        }));

        const { data, error } = await supabase
            .from(this.tableName)
            .insert(payload)
            .select();

        if (error) throw error;
        return data || [];
    }
}
export default GeneratedSectionRepository;
