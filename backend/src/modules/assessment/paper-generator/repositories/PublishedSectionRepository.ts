import { supabase } from '../../../../config/supabase';
import { BaseRepository } from '../../../admission/repositories/BaseRepository';

export class PublishedSectionRepository extends BaseRepository<any> {
    constructor() {
        super('assessment_published_sections');
    }

    public async savePublishedSections(publishedPaperId: string, sections: any[]): Promise<any[]> {
        const payload = sections.map(sec => ({
            published_paper_id: publishedPaperId,
            section_name: sec.section_name,
            description: sec.description || null,
            points_per_question: sec.points_per_question,
            negative_marks: sec.negative_marks,
            total_questions: sec.total_questions,
            sort_order: sec.sort_order
        }));

        const { data, error } = await supabase
            .from(this.tableName)
            .insert(payload)
            .select();

        if (error) throw error;
        return data || [];
    }
}
export default PublishedSectionRepository;
