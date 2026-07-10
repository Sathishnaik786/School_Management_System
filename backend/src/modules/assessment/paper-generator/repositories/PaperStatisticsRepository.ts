import { supabase } from '../../../../config/supabase';
import { BaseRepository } from '../../../admission/repositories/BaseRepository';

export class PaperStatisticsRepository extends BaseRepository<any> {
    constructor() {
        super('assessment_generated_statistics');
    }

    public async saveStatistics(paperId: string, stats: any): Promise<any> {
        const { error: delError } = await supabase
            .from(this.tableName)
            .delete()
            .eq('paper_id', paperId);

        if (delError) throw delError;

        const { data, error } = await supabase
            .from(this.tableName)
            .insert({
                ...stats,
                paper_id: paperId
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}
export default PaperStatisticsRepository;
