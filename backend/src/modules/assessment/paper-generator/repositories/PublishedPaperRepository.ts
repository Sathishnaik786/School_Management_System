import { supabase } from '../../../../config/supabase';
import { BaseRepository } from '../../../admission/repositories/BaseRepository';

export class PublishedPaperRepository extends BaseRepository<any> {
    constructor() {
        super('assessment_published_papers');
    }

    public async findByGeneratedId(generatedId: string, schoolId: string): Promise<any | null> {
        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('generated_paper_id', generatedId)
            .eq('school_id', schoolId)
            .maybeSingle();

        if (error) throw error;
        return data;
    }

    public async publishPaper(schoolId: string, payload: any): Promise<any> {
        const { data, error } = await supabase
            .from(this.tableName)
            .insert({
                ...payload,
                school_id: schoolId
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}
export default PublishedPaperRepository;
