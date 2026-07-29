import { supabase } from '../../../../config/supabase';
import { BaseRepository } from '../../../admission/repositories/BaseRepository';

export class PaperExportRepository extends BaseRepository<any> {
    constructor() {
        super('assessment_generated_exports');
    }

    public async saveExportLog(
        paperId: string,
        format: 'PDF' | 'DOCX' | 'HTML' | 'ZIP',
        type: 'candidate' | 'moderator' | 'answer_key',
        filePath: string,
        userId?: string
    ): Promise<any> {
        const { data, error } = await supabase
            .from(this.tableName)
            .insert({
                paper_id: paperId,
                format,
                type,
                file_path: filePath,
                generated_by: userId || null
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}
export default PaperExportRepository;
