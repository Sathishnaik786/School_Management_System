import { supabase } from '../../../../config/supabase';
import { BaseRepository } from '../../../admission/repositories/BaseRepository';

export class PaperVersionRepository extends BaseRepository<any> {
    constructor() {
        super('assessment_generated_versions');
    }

    public async saveSnapshot(paperId: string, version: number, schemaSnapshot: any): Promise<any> {
        const { data, error } = await supabase
            .from(this.tableName)
            .insert({
                paper_id: paperId,
                version,
                schema_snapshot: schemaSnapshot
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}
export default PaperVersionRepository;
