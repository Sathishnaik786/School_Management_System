import { supabase } from '../../../../config/supabase';
import { BaseRepository } from '../../../admission/repositories/BaseRepository';

export class PaperPackageRepository extends BaseRepository<any> {
    constructor() {
        super('assessment_paper_packages');
    }

    public async savePackage(publishedPaperId: string, payload: any): Promise<any> {
        const { data, error } = await supabase
            .from(this.tableName)
            .insert({
                published_paper_id: publishedPaperId,
                candidate_pdf: payload.candidate_pdf || null,
                moderator_pdf: payload.moderator_pdf || null,
                answer_key_pdf: payload.answer_key_pdf || null,
                encrypted_package: payload.encrypted_package || null,
                checksum: payload.checksum || 'N/A',
                metadata: payload.metadata || {}
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    public async findByPublishedId(publishedPaperId: string): Promise<any | null> {
        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('published_paper_id', publishedPaperId)
            .maybeSingle();

        if (error) throw error;
        return data;
    }
}
export default PaperPackageRepository;
